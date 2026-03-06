/**
 * API Proxy Routes — Forwards requests to FastAPI backend
 * Adds caching, request transform, and error handling.
 */

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = express.Router();
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// Proxy all /api/* requests to FastAPI
const apiProxy = createProxyMiddleware({
  target: FASTAPI_URL,
  changeOrigin: true,
  // pathRewrite removed: backend routes already use /api/ prefix
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req) => {
    // Forward the original IP
    proxyReq.setHeader("X-Forwarded-For", req.ip);
    proxyReq.setHeader("X-Gateway-Version", "1.0.0");

    // Re-stream body for POST/PUT
    if (req.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers["X-Powered-By"] = "ChessMaster Gateway";
    proxyRes.headers["X-Response-Time"] = `${Date.now() - req._startTime}ms`;
  },
  onError: (err, req, res) => {
    console.error(`[PROXY] Error: ${err.message}`);
    res.status(502).json({
      error: "Bad Gateway",
      message: "FastAPI backend is unavailable",
      target: FASTAPI_URL,
    });
  },
});

// Attach start time for response timing
router.use((req, res, next) => {
  req._startTime = Date.now();
  next();
});

router.use("/", apiProxy);

module.exports = router;
