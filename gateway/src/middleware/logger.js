/**
 * Request Logger Middleware — Tracks response times and feeds analytics
 */

const { trackRequest } = require("../routes/analytics");

function requestLogger(req, res, next) {
  const start = Date.now();

  // Override end to capture timing
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - start;
    const path = req.originalUrl || req.url;

    // Feed analytics
    try {
      trackRequest(req.method, path, res.statusCode, responseTime);
    } catch (e) {
      // Analytics errors shouldn't break requests
    }

    originalEnd.apply(res, args);
  };

  next();
}

module.exports = { requestLogger };
