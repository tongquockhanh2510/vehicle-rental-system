import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateToken } from './middleware/auth.js';
import { generalLimiter, authLimiter, paymentLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.API_GATEWAY_PORT;

// Middleware
app.use(express.json());
app.use(authenticateToken);
app.use(generalLimiter);

// Service URLs
const services = {
  users: process.env.USER_SERVICE_URL,
  vehicles: process.env.VEHICLE_SERVICE_URL,
  rentals: process.env.RENTAL_SERVICE_URL,
  contracts: process.env.CONTRACT_SERVICE_URL,
  payments: process.env.PAYMENT_SERVICE_URL,
  tracking: process.env.TRACKING_SERVICE_URL,
  disputes: process.env.DISPUTE_SERVICE_URL,
  reviews: process.env.REVIEW_SERVICE_URL,
  notifications: process.env.NOTIFICATION_SERVICE_URL,
  statistics: process.env.STATISTIC_SERVICE_URL
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Gateway is running' });
});

// User routes
app.use('/api/users', createProxyMiddleware({
  target: services.users,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  }
}));

// Vehicle routes
app.use('/api/vehicles', createProxyMiddleware({
  target: services.vehicles,
  changeOrigin: true,
  pathRewrite: {
    '^/api/vehicles': '/api/vehicles'
  }
}));

// Rental routes
app.use('/api/rentals', createProxyMiddleware({
  target: services.rentals,
  changeOrigin: true,
  pathRewrite: {
    '^/api/rentals': '/api/rentals'
  }
}));

// Contract routes
app.use('/api/contracts', createProxyMiddleware({
  target: services.contracts,
  changeOrigin: true,
  pathRewrite: {
    '^/api/contracts': '/api/contracts'
  }
}));

// Payment routes (with rate limiting)
app.use('/api/payments', paymentLimiter, createProxyMiddleware({
  target: services.payments,
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': '/api/payments'
  }
}));

// Tracking routes
app.use('/api/tracking', createProxyMiddleware({
  target: services.tracking,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tracking': '/api/tracking'
  }
}));

// Dispute routes
app.use('/api/disputes', createProxyMiddleware({
  target: services.disputes,
  changeOrigin: true,
  pathRewrite: {
    '^/api/disputes': '/api/disputes'
  }
}));

// Review routes
app.use('/api/reviews', createProxyMiddleware({
  target: services.reviews,
  changeOrigin: true,
  pathRewrite: {
    '^/api/reviews': '/api/reviews'
  }
}));

// Notification routes
app.use('/api/notifications', createProxyMiddleware({
  target: services.notifications,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications'
  }
}));

// Statistics routes (admin only)
app.use('/api/statistics', createProxyMiddleware({
  target: services.statistics,
  changeOrigin: true,
  pathRewrite: {
    '^/api/statistics': '/api/statistics'
  }
}));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
