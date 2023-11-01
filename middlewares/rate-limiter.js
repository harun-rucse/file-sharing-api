const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1000,
  message: 'Daily limit exceeded, please try again later.',
});

module.exports = { rateLimiter };
