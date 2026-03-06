/**
 * Health Check Routes — Service monitoring
 */

const express = require("express");
const axios = require("axios");
const { getStats } = require("../websocket/gameSocket");

const router = express.Router();
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

router.get("/", async (req, res) => {
  let backendStatus = "down";
  let backendLatency = null;

  try {
    const start = Date.now();
    const response = await axios.get(FASTAPI_URL, { timeout: 5000 });
    backendLatency = Date.now() - start;
    backendStatus = response.status === 200 ? "healthy" : "degraded";
  } catch (err) {
    backendStatus = "unreachable";
  }

  const wsStats = getStats();
  const overall =
    backendStatus === "healthy" ? "healthy" : backendStatus === "degraded" ? "degraded" : "partial";

  res.status(overall === "healthy" ? 200 : 503).json({
    status: overall,
    timestamp: new Date().toISOString(),
    services: {
      gateway: {
        status: "healthy",
        uptime: `${Math.floor(process.uptime())}s`,
        version: "1.0.0",
      },
      backend: {
        status: backendStatus,
        url: FASTAPI_URL,
        latency: backendLatency ? `${backendLatency}ms` : null,
      },
      websocket: {
        status: "healthy",
        activeConnections: wsStats.activeConnections,
        activeRooms: wsStats.activeRooms,
      },
    },
  });
});

module.exports = router;
