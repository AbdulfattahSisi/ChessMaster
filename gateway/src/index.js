/**
 * ♛ ChessMaster Real-Time Gateway
 * Node.js / Express — WebSocket server + API proxy + caching + rate limiting
 *
 * Architecture:
 *   Mobile ──► Express Gateway (:3000) ──► FastAPI Backend (:8000)
 *                  │
 *                  ├── REST proxy with caching
 *                  ├── Rate limiting & security (Helmet)
 *                  ├── WebSocket for real-time game events
 *                  └── Analytics & health monitoring
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { setupWebSocket } = require("./websocket/gameSocket");
const proxyRoutes = require("./routes/proxy");
const analyticsRoutes = require("./routes/analytics");
const healthRoutes = require("./routes/health");
const { cacheMiddleware } = require("./middleware/cache");
const { requestLogger } = require("./middleware/logger");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// ──────────────── Security ────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ──────────────── CORS ────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ──────────────── Rate Limiting ────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: "Too many requests",
    message: "Rate limit exceeded. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// ──────────────── Middleware ────────────────
app.use(express.json());
app.use(morgan("dev"));
app.use(requestLogger);

// ──────────────── Routes ────────────────
app.use("/health", healthRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/api", cacheMiddleware, proxyRoutes);

// ──────────────── WebSocket ────────────────
setupWebSocket(server);

// ──────────────── Root ────────────────
app.get("/", (req, res) => {
  res.json({
    service: "ChessMaster Gateway",
    version: "1.0.0",
    stack: "Node.js / Express",
    features: [
      "REST API Proxy with caching",
      "WebSocket real-time game events",
      "Rate limiting & security",
      "Request analytics & monitoring",
    ],
    endpoints: {
      health: "/health",
      analytics: "/analytics",
      api: "/api/* → proxied to FastAPI",
      websocket: "ws://localhost:3000",
    },
  });
});

// ──────────────── Error Handler ────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || "Internal Gateway Error",
    timestamp: new Date().toISOString(),
  });
});

// ──────────────── Start ────────────────
server.listen(PORT, () => {
  console.log(`\n♛ ChessMaster Gateway running on http://localhost:${PORT}`);
  console.log(`  ├── REST proxy  → ${process.env.FASTAPI_URL || "http://localhost:8000"}`);
  console.log(`  ├── WebSocket   → ws://localhost:${PORT}`);
  console.log(`  ├── Health      → http://localhost:${PORT}/health`);
  console.log(`  └── Analytics   → http://localhost:${PORT}/analytics\n`);
});

module.exports = { app, server };
