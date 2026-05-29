import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { randomUUID } from 'crypto';

import { authenticateToken } from './middleware/auth.js';
import {
  generalLimiter,
  authLimiter,
  paymentLimiter
} from './middleware/rateLimiter.js';
dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 8000;
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests and approved browser origins.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true
};

app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));

app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${req.requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`
    );
  });

  next();
});

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

app.use(generalLimiter);

const unavailableProxy = (serviceName) => (req, res) => {
  res.status(503).json({
    error: 'Service unavailable',
    service: serviceName,
    message: `${serviceName} is not configured`
  });
};

const proxy = (serviceName) => {
  const target = services[serviceName];

  if (!target) {
    return unavailableProxy(serviceName);
  }

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    onProxyReq(proxyReq, req) {
      proxyReq.setHeader('X-Request-ID', req.requestId);
    },
    onError(err, req, res) {
      console.error(`[${req.requestId}] Proxy error (${serviceName}):`, err.message);
      res.status(502).json({
        error: 'Bad gateway',
        service: serviceName,
        request_id: req.requestId,
        message: err.message
      });
    }
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    message: 'API Gateway is running',
    port: PORT,
    services
  });
});

// ================= USER ROUTES =================

// public
app.use('/api/users/register', authLimiter, proxy('users'));
app.use('/api/users/login', authLimiter, proxy('users'));

// protected
app.use('/api/users', authenticateToken, proxy('users'));
app.use('/api/owner-applications', authenticateToken, proxy('users'));

// ================= VEHICLE ROUTES =================

// public vehicle routes
app.use('/api/vehicles/available/list', proxy('vehicles'));
app.use('/api/vehicles/search', proxy('vehicles'));
app.use('/api/vehicles/owner', proxy('vehicles'));
app.use('/api/vehicles/:vehicleId', proxy('vehicles'));

// protected vehicle routes
app.use('/api/vehicles', authenticateToken, proxy('vehicles'));

// ================= OTHER SERVICES =================

app.use('/api/rentals', authenticateToken, proxy('rentals'));

app.use('/api/contracts', authenticateToken, proxy('contracts'));

app.use(
  '/api/payments',
  authenticateToken,
  paymentLimiter,
  proxy('payments')
);

app.use('/api/tracking', authenticateToken, proxy('tracking'));

app.use('/api/disputes', authenticateToken, proxy('disputes'));

app.use('/api/reviews', authenticateToken, proxy('reviews'));

app.use('/api/notifications', authenticateToken, proxy('notifications'));

app.use('/api/statistics', authenticateToken, proxy('statistics'));

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

app.options('*', cors(corsOptions));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
