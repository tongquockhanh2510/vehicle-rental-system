const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const { redis } = require('../config/redis.config');

// Rate limiter configurations
const rateLimiterConfig = {
  // Points - number of requests allowed
  // Duration - time window in seconds
  
  // 1. Client-side rate limiter (per IP)
  clientRateLimiter: {
    points: 100,        // 100 requests
    duration: 60,       // per 60 seconds (1 minute)
    blockDuration: 60    // block for 60 seconds if exceeded
  },
  
  // 2. Server-side rate limiter (per API endpoint)
  serverRateLimiter: {
    points: 1000,       // 1000 requests
    duration: 60,       // per 60 seconds
    blockDuration: 60   // block for 60 seconds if exceeded
  },
  
  // 3. Auth endpoints (stricter)
  authRateLimiter: {
    points: 10,        // Only 10 attempts
    duration: 300,      // per 5 minutes
    blockDuration: 900 // block for 15 minutes if exceeded (15 minutes)
  },
  
  // 4. Critical endpoints (strictest)
  criticalRateLimiter: {
    points: 5,         // Only 5 attempts
    duration: 60,       // per minute
    blockDuration: 300 // block for 5 minutes
  }
};

// Create rate limiters
let clientLimiter;
let serverLimiter;
let authLimiter;
let criticalLimiter;

const initRateLimiters = async () => {
  try {
    // Try to use Redis with timeout
    const isRedisAvailable = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);
      redis.ping((err) => {
        clearTimeout(timeout);
        resolve(!err);
      });
    });
    
    if (isRedisAvailable) {
      console.log('🛡️  Rate Limiter: Using Redis backend');
      
      clientLimiter = new RateLimiterRedis({
        redis: redis,
        keyPrefix: 'rl_client',
        ...rateLimiterConfig.clientRateLimiter,
        storeClient: redis
      });
      
      serverLimiter = new RateLimiterRedis({
        redis: redis,
        keyPrefix: 'rl_server',
        ...rateLimiterConfig.serverRateLimiter,
        storeClient: redis
      });
      
      authLimiter = new RateLimiterRedis({
        redis: redis,
        keyPrefix: 'rl_auth',
        ...rateLimiterConfig.authRateLimiter,
        storeClient: redis
      });
      
      criticalLimiter = new RateLimiterRedis({
        redis: redis,
        keyPrefix: 'rl_critical',
        ...rateLimiterConfig.criticalRateLimiter,
        storeClient: redis
      });
    } else {
      console.log('🛡️  Rate Limiter: Using Memory fallback');
      
      // Fallback to memory-based rate limiter
      clientLimiter = new RateLimiterMemory(rateLimiterConfig.clientRateLimiter);
      serverLimiter = new RateLimiterMemory(rateLimiterConfig.serverRateLimiter);
      authLimiter = new RateLimiterMemory(rateLimiterConfig.authRateLimiter);
      criticalLimiter = new RateLimiterMemory(rateLimiterConfig.criticalRateLimiter);
    }
    
    console.log('🛡️  Rate Limiter: Initialized successfully');
    return true;
  } catch (err) {
    console.error('🛡️  Rate Limiter: Initialization failed:', err.message);
    // Fallback to memory
    clientLimiter = new RateLimiterMemory(rateLimiterConfig.clientRateLimiter);
    serverLimiter = new RateLimiterMemory(rateLimiterConfig.serverRateLimiter);
    authLimiter = new RateLimiterMemory(rateLimiterConfig.authRateLimiter);
    criticalLimiter = new RateLimiterMemory(rateLimiterConfig.criticalRateLimiter);
    return false;
  }
};

// Middleware factories
const createRateLimiterMiddleware = (limiterGetter, customMessage = null) => {
  return async (req, res, next) => {
    try {
      const limiter = limiterGetter();
      if (!limiter) {
        // Rate limiter not initialized yet, skip
        return next();
      }
      
      const clientKey = req.ip || req.connection.remoteAddress || 'unknown';
      const endpointKey = req.originalUrl || req.url;
      const key = `${clientKey}:${endpointKey}`;
      
      const result = await limiter.consume(key);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': result.totalHits,
        'X-RateLimit-Remaining': result.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString()
      });
      
      next();
    } catch (err) {
      // rate-limiter-flexible throws RateLimiterRes object (not Error)
      // Check for msBeforeNext to identify rate limit error
      const msBeforeNext = err.msBeforeNext || err.getMSBeforeNext?.() || 0;
      
      if (msBeforeNext > 0 || err.remainingPoints === 0) {
        // Rate limit exceeded
        const retryAfter = Math.ceil(msBeforeNext / 1000);
        
        const resetTime = (msBeforeNext && msBeforeNext > 0)
        ? new Date(Date.now() + msBeforeNext).toISOString()
        : new Date(Date.now() + 60000).toISOString();

        res.set({
          'X-RateLimit-Limit': 0,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': resetTime,
          'Retry-After': retryAfter
        });
        
        return res.status(429).json({
          error: customMessage || 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
          retryAfter: retryAfter,
          message: `Bạn đã vượt quá giới hạn. Vui lòng đợi ${retryAfter} giây.`
        });
      }
      next(err);
    }
  };
};

// Pre-configured middlewares using getter pattern
const clientRateLimiter = createRateLimiterMiddleware(
  () => clientLimiter,
  'Quá nhiều yêu cầu từ IP này. Vui lòng đợi.'
);

const serverRateLimiter = createRateLimiterMiddleware(
  () => serverLimiter,
  'Máy chủ đang bận. Vui lòng thử lại sau.'
);

const authRateLimiter = createRateLimiterMiddleware(
  () => authLimiter,
  'Quá nhiều lần đăng nhập thất bại. Tài khoản bị tạm khóa trong 15 phút.'
);

const criticalRateLimiter = createRateLimiterMiddleware(
  () => criticalLimiter,
  'Yêu cầu bị từ chối vì lý do bảo mật. Vui lòng thử lại sau.'
);

// Status endpoint for rate limiter info
const getRateLimiterStatus = async () => {
  try {
    // Use a quick timeout to check Redis without hanging
    const checkRedis = new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 500);
      redis.ping((err) => {
        clearTimeout(timeout);
        resolve(!err);
      });
    });
    
    const isRedisAvailable = await checkRedis;
    
    return {
      backend: isRedisAvailable ? 'Redis' : 'Memory',
      config: rateLimiterConfig,
      status: 'active'
    };
  } catch (err) {
    return {
      backend: 'Memory',
      config: rateLimiterConfig,
      status: 'active'
    };
  }
};

module.exports = {
  initRateLimiters,
  clientRateLimiter,
  serverRateLimiter,
  authRateLimiter,
  criticalRateLimiter,
  getRateLimiterStatus,
  rateLimiterConfig
};
