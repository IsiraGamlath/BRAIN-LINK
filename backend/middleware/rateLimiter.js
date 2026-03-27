// middleware/rateLimiter.js — Simple in-memory rate limiter (no express-rate-limit needed)
const rateLimitMap = new Map();

const createLimiter = ({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests, please try again later.' } = {}) => {
  return (req, res, next) => {
    const key  = `${req.ip}_${req.path}`;
    const now  = Date.now();
    const data = rateLimitMap.get(key) || { count: 0, start: now };

    if (now - data.start > windowMs) {
      // Window expired — reset
      rateLimitMap.set(key, { count: 1, start: now });
      return next();
    }

    data.count++;
    rateLimitMap.set(key, data);

    if (data.count > max) {
      return res.status(429).json({ message, retryAfter: Math.ceil((data.start + windowMs - now) / 1000) });
    }

    next();
  };
};

// Auth routes: 10 attempts per 15 minutes
const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many auth attempts. Try again in 15 minutes.' });

// General API: 100 requests per 15 minutes
const apiLimiter  = createLimiter({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests. Slow down.' });

module.exports = { authLimiter, apiLimiter, createLimiter };
