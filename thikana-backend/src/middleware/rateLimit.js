const rateLimit = require('express-rate-limit');

// General API limiter - protects the server and the Gemini free quota
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down.' } }
});

// Tighter limiter for AI-backed routes
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'AI_RATE_LIMITED', message: 'AI feature is busy, try again shortly.' } }
});

module.exports = { apiLimiter, aiLimiter };
