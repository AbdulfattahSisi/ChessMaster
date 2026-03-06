/**
 * Cache Middleware — In-memory response caching for GET requests
 */

const NodeCache = require("node-cache");

const TTL = parseInt(process.env.CACHE_TTL) || 60; // seconds
const cache = new NodeCache({ stdTTL: TTL, checkperiod: TTL * 0.2 });

function cacheMiddleware(req, res, next) {
  // Only cache GET requests
  if (req.method !== "GET") {
    return next();
  }

  // Don't cache authenticated routes
  if (req.headers.authorization) {
    return next();
  }

  const key = `__cache__${req.originalUrl}`;
  const cached = cache.get(key);

  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.setHeader("X-Cache-TTL", TTL);
    return res.json(cached);
  }

  // Override res.json to cache the response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    res.setHeader("X-Cache", "MISS");
    return originalJson(body);
  };

  next();
}

function clearCache() {
  cache.flushAll();
}

module.exports = { cacheMiddleware, clearCache };
