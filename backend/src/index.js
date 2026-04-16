const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { connectRedis, cacheUtils } = require('./config/redis.config');
const { initRateLimiters, clientRateLimiter, authRateLimiter, getRateLimiterStatus } = require('./middleware/rateLimiter.middleware');
const { getRetryStatus } = require('./middleware/retry.middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const initServices = async () => {
  console.log('🚀 Initializing services...');
  
  // Connect to Redis
  await connectRedis();
  
  // Initialize Rate Limiters
  await initRateLimiters();
  
  console.log('✅ All services initialized');
};

// Apply rate limiters (client-side for all routes)
app.use('/api', clientRateLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Vehicle Rental API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      rateLimiter: '/api/rate-limiter/status',
      cacheTest: '/api/cache/test',
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      bookings: '/api/bookings',
      payments: '/api/payments',
      notifications: '/api/notifications'
    }
  });
});

// Health check - includes service status
app.get('/api/health', async (req, res) => {
  const redisAvailable = await cacheUtils.isAvailable();
  const rateLimiterStatus = await getRateLimiterStatus();
  const retryStatus = getRetryStatus();
  
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    services: {
      redis: redisAvailable ? 'connected' : 'disconnected',
      rateLimiter: rateLimiterStatus,
      retry: retryStatus
    }
  });
});

// Rate limiter status endpoint
app.get('/api/rate-limiter/status', async (req, res) => {
  const status = await getRateLimiterStatus();
  const redisAvailable = await cacheUtils.isAvailable();
  
  res.json({
    ...status,
    redisConnected: redisAvailable
  });
});

// Cache utilities endpoint (for testing)
app.get('/api/cache/test', async (req, res) => {
  try {
    const redisAvailable = await cacheUtils.isAvailable();
    if (!redisAvailable) {
      return res.status(503).json({ 
        success: false, 
        error: 'Redis is not available',
        message: 'Please start Redis server on localhost:6379'
      });
    }
    
    await cacheUtils.set('test_key', { message: 'Hello from Redis!', timestamp: Date.now() }, 60);
    const data = await cacheUtils.get('test_key');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear all cache
app.post('/api/cache/clear', async (req, res) => {
  try {
    await cacheUtils.delPattern('*');
    res.json({ success: true, message: 'Cache cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes - Auth routes with stricter rate limiting
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;

// Initialize and start
initServices().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  Rate Limiter: http://localhost:${PORT}/api/rate-limiter/status`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize services:', err);
  // Start anyway with degraded functionality
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} (degraded mode)`);
  });
});

module.exports = app;
