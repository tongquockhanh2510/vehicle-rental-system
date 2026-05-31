import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cors from 'cors';

import { authenticateToken } from './middleware/auth.js';
import {
  generalLimiter,
  authLimiter,
  paymentLimiter
} from './middleware/rateLimiter.js';
dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 8000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


const services = {
  users: process.env.USER_SERVICE_URL,
  vehicles: process.env.VEHICLE_SERVICE_URL,
  rentals: process.env.RENTAL_SERVICE_URL,
  contracts: process.env.CONTRACT_SERVICE_URL,
  payments: process.env.PAYMENT_SERVICE_URL,
  tracking: process.env.TRACKING_SERVICE_URL || 'http://localhost:5005',
  disputes: process.env.DISPUTE_SERVICE_URL,
  reviews: process.env.REVIEW_SERVICE_URL,
  notifications: process.env.NOTIFICATION_SERVICE_URL,
  statistics: process.env.STATISTIC_SERVICE_URL
};

app.use(generalLimiter);

const proxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    onError(err, req, res) {
      console.error('Proxy error:', err.message);
      res.status(502).json({
        error: 'Bad gateway',
        message: err.message
      });
    }
  });

// Health check
app.get('/health', (req, res) => {
  res.json({
    message: 'API Gateway is running',
    port: PORT
  });
});

// ================= USER ROUTES =================

// public
app.use('/api/users/register', authLimiter, proxy(services.users));
app.use('/api/users/login', authLimiter, proxy(services.users));

// protected
app.use('/api/users', authenticateToken, proxy(services.users));

// ================= VEHICLE ROUTES =================

// public vehicle routes
app.use('/api/vehicles/available/list', proxy(services.vehicles));
app.use('/api/vehicles/owner', proxy(services.vehicles));
app.use('/api/vehicles/:vehicleId', proxy(services.vehicles));

// protected vehicle routes
app.use('/api/vehicles', authenticateToken, proxy(services.vehicles));

// ================= OTHER SERVICES =================

app.use('/api/rentals', authenticateToken, proxy(services.rentals));

app.use('/api/contracts', authenticateToken, proxy(services.contracts));

app.use(
  '/api/payments',
  authenticateToken,
  paymentLimiter,
  proxy(services.payments)
);

app.use('/api/tracking', authenticateToken, proxy(services.tracking));

app.use('/api/disputes', authenticateToken, proxy(services.disputes));

app.use('/api/reviews', authenticateToken, proxy(services.reviews));

app.use('/api/notifications', authenticateToken, proxy(services.notifications));

app.use('/api/statistics', authenticateToken, proxy(services.statistics));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.options('*', cors());

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
