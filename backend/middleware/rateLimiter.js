/**
 * Rate Limiting Middleware
 * Prevents brute force attacks on authentication endpoints
 */

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map();

const createRateLimiter = (windowMs, maxRequests) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || (now - entry.windowStart) > windowMs) {
      // New window or expired window
      entry = {
        count: 1,
        windowStart: now
      };
      rateLimitStore.set(key, entry);
      return next();
    }
    
    // Increment count
    entry.count++;
    
    if (entry.count > maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${retryAfter} seconds.`,
        retryAfter
      });
    }
    
    rateLimitStore.set(key, entry);
    next();
  };
};

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Pre-configured limiters
const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const generalRateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

module.exports = {
  authRateLimiter,
  generalRateLimiter,
  createRateLimiter
};

