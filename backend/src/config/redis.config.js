const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
};

// Create Redis client
const redis = new Redis(redisConfig);

// Event handlers
redis.on('connect', () => {
  console.log('🔴 Redis: Connected successfully');
});

redis.on('error', (err) => {
  console.error('🔴 Redis: Connection error:', err.message);
});

redis.on('close', () => {
  console.log('🔴 Redis: Connection closed');
});

// Connect function
const connectRedis = async () => {
  try {
    await redis.connect();
    return true;
  } catch (err) {
    console.error('🔴 Redis: Failed to connect:', err.message);
    return false;
  }
};

// Cache utilities
const cacheUtils = {
  // Helper: wrap Redis operation with timeout
  withTimeout(promise, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Redis timeout')), timeoutMs);
      promise.then((val) => { clearTimeout(timer); resolve(val); })
              .catch((err) => { clearTimeout(timer); reject(err); });
    });
  },

  // Set cache with expiration (default 5 minutes)
  async set(key, value, expireSeconds = 300) {
    try {
      const serialized = JSON.stringify(value);
      await this.withTimeout(redis.setex(key, expireSeconds, serialized));
      return true;
    } catch (err) {
      console.error('Cache set error:', err.message);
      return false;
    }
  },

  // Get cache
  async get(key) {
    try {
      const data = await this.withTimeout(redis.get(key));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err.message);
      return null;
    }
  },

  // Delete cache
  async del(key) {
    try {
      await this.withTimeout(redis.del(key));
      return true;
    } catch (err) {
      console.error('Cache delete error:', err.message);
      return false;
    }
  },

  // Delete cache by pattern
  async delPattern(pattern) {
    try {
      const keys = await this.withTimeout(redis.keys(pattern));
      if (keys.length > 0) {
        await this.withTimeout(redis.del(...keys));
      }
      return true;
    } catch (err) {
      console.error('Cache delete pattern error:', err.message);
      return false;
    }
  },

  // Check if Redis is available
  async isAvailable() {
    try {
      await this.withTimeout(redis.ping(), 500);
      return true;
    } catch (err) {
      return false;
    }
  }
};

module.exports = {
  redis,
  connectRedis,
  cacheUtils
};
