const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const jsonHandler = (req, res) => {
  res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
};

// Generic limiter for the whole /api surface.
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMin * 60 * 1000,
  max: env.rateLimit.maxAttempts * 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
});

// Tighter limiter for auth endpoints that are attractive brute-force targets.
const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMin * 60 * 1000,
  max: env.rateLimit.maxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  skipSuccessfulRequests: true,
});

module.exports = { apiLimiter, authLimiter };
