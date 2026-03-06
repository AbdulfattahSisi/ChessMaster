/**
 * Analytics Routes — Request statistics & monitoring
 */

const express = require("express");
const { getStats } = require("../websocket/gameSocket");

const router = express.Router();

// In-memory request analytics
const requestLog = {
  totalRequests: 0,
  endpoints: {},
  methods: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 },
  statusCodes: {},
  startTime: new Date().toISOString(),
  avgResponseTime: 0,
  _responseTimes: [],
};

// Track requests (called from logger middleware)
function trackRequest(method, path, statusCode, responseTime) {
  requestLog.totalRequests++;
  requestLog.methods[method] = (requestLog.methods[method] || 0) + 1;
  requestLog.statusCodes[statusCode] = (requestLog.statusCodes[statusCode] || 0) + 1;

  // Track top endpoints
  const endpoint = `${method} ${path}`;
  requestLog.endpoints[endpoint] = (requestLog.endpoints[endpoint] || 0) + 1;

  // Rolling average response time (keep last 100)
  requestLog._responseTimes.push(responseTime);
  if (requestLog._responseTimes.length > 100) requestLog._responseTimes.shift();
  requestLog.avgResponseTime = Math.round(
    requestLog._responseTimes.reduce((a, b) => a + b, 0) / requestLog._responseTimes.length
  );
}

// GET /analytics — Full dashboard data
router.get("/", (req, res) => {
  const wsStats = getStats();
  const uptime = process.uptime();

  res.json({
    gateway: {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      startedAt: requestLog.startTime,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      nodeVersion: process.version,
    },
    requests: {
      total: requestLog.totalRequests,
      byMethod: requestLog.methods,
      byStatus: requestLog.statusCodes,
      avgResponseTime: `${requestLog.avgResponseTime}ms`,
      topEndpoints: Object.entries(requestLog.endpoints)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count })),
    },
    websocket: wsStats,
  });
});

// GET /analytics/live — SSE stream for live monitoring
router.get("/live", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const data = {
      timestamp: new Date().toISOString(),
      requests: requestLog.totalRequests,
      websocket: getStats(),
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 2000);

  req.on("close", () => clearInterval(interval));
});

module.exports = router;
module.exports.trackRequest = trackRequest;
