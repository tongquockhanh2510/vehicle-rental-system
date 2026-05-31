import rateLimit from 'express-rate-limit';

const parseLimit = (value, fallback) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseLimit(process.env.GENERAL_RATE_LIMIT_MAX, 1000),
  message: 'Too many requests from this IP, please try again later.'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseLimit(process.env.AUTH_RATE_LIMIT_MAX, 30),
  skipSuccessfulRequests: true
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseLimit(process.env.PAYMENT_RATE_LIMIT_MAX, 120),
  skipSuccessfulRequests: true
});
