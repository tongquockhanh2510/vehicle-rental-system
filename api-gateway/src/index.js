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
  tracking: process.env.TRACKING_SERVICE_URL || 'http://localhost:5005',
  disputes: process.env.DISPUTE_SERVICE_URL,
  reviews: process.env.REVIEW_SERVICE_URL,
  notifications: process.env.NOTIFICATION_SERVICE_URL,
  statistics: process.env.STATISTIC_SERVICE_URL
};

app.use(generalLimiter);

const isAdminRequest = (req) => String(req.userRole || '').toUpperCase() === 'ADMIN';

const requireAdmin = (req, res, next) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin permission required'
    });
  }
  return next();
};

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

const proxyWithRewrite = (serviceName, pathRewrite) => {
  const target = services[serviceName];

  if (!target) {
    return unavailableProxy(serviceName);
  }

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    pathRewrite,
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

async function fetchJson(url, req) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: req.headers.authorization || '',
      'X-Request-ID': req.requestId
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.error || body?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return body;
}

const pickRows = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const toUpper = (value) => String(value || '').toUpperCase();

// Health check
app.get('/health', (req, res) => {
  res.json({
    message: 'API Gateway is running',
    port: PORT,
    services
  });
});

app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [statsPayload, usersPayload, ownerAppsPayload] = await Promise.all([
      fetchJson(`${services.statistics}/api/statistics/dashboard`, req),
      fetchJson(`${services.users}/api/users?page=1&limit=500`, req),
      fetchJson(`${services.users}/api/owner-applications`, req)
    ]);

    const stats = statsPayload?.data || statsPayload || {};
    const users = pickRows(usersPayload);
    const ownerApps = pickRows(ownerAppsPayload);

    const totalUsers = Number(stats.total_users || usersPayload?.pagination?.total || users.length || 0);
    const totalRenters = users.filter((item) => toUpper(item.role) === 'USER').length;
    const approvedOwners = users.filter((item) => toUpper(item.owner_status) === 'APPROVED').length;
    const pendingOwnerApplications = ownerApps.filter((item) => toUpper(item.status) === 'PENDING').length;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalRenters,
        approvedOwners,
        pendingOwnerApplications,
        totalVehicles: Number(stats.total_vehicles || 0),
        pendingRentals: Number(stats.pending_rentals || 0),
        activeContracts: Number(stats.active_contracts || 0),
        totalRevenue: Number(stats.total_revenue || 0),
        platformFeeRevenue: Number(stats.platform_revenue || 0),
        pendingDisputes: Number(stats.pending_disputes || 0)
      }
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to load admin dashboard'
    });
  }
});

app.use(
  '/api/admin/users',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('users', { '^/api/admin/users': '/api/users' })
);
app.use(
  '/api/admin/owner-applications',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('users', { '^/api/admin/owner-applications': '/api/owner-applications' })
);
app.use(
  '/api/admin/vehicles',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('vehicles', { '^/api/admin/vehicles': '/api/vehicles/admin/list' })
);
app.use(
  '/api/admin/rentals',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('rentals', { '^/api/admin/rentals': '/api/rentals/admin/list' })
);
app.use(
  '/api/admin/contracts',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('contracts', { '^/api/admin/contracts': '/api/contracts/admin/list' })
);
app.use(
  '/api/admin/payments',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('payments', { '^/api/admin/payments': '/api/payments/admin/list' })
);
app.use(
  '/api/admin/disputes',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('disputes', { '^/api/admin/disputes': '/api/disputes/admin/list' })
);
app.use(
  '/api/admin/statistics',
  authenticateToken,
  requireAdmin,
  proxyWithRewrite('statistics', { '^/api/admin/statistics': '/api/statistics/dashboard' })
);

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
