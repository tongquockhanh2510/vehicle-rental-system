const AuthService = require('../services/auth.service');
const UserModel = require('../models/user.model');
const { cacheUtils } = require('../config/redis.config');
const { withRetry } = require('../middleware/retry.middleware');

const USER_CACHE_TTL = 600; // 10 minutes

const AuthController = {
  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const { email, password, fullname, phone, role } = req.body;

      if (!email || !password || !fullname) {
        return res.status(400).json({ error: 'Email, password and fullname are required' });
      }

      const result = await withRetry(async () => {
        return await AuthService.register({ email, password, fullname, phone, role });
      }, { maxRetries: 3 });
      
      if (result.success) {
        res.status(201).json(result.data);
      } else {
        throw result.error;
      }
    } catch (err) {
      if (err.message === 'Email already registered') {
        return res.status(409).json({ error: err.message });
      }
      next(err);
    }
  },

  /**
   * Login with rate limiting (handled by middleware)
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await withRetry(async () => {
        return await AuthService.login({ email, password });
      }, { maxRetries: 3 });
      
      if (result.success) {
        res.json(result.data);
      } else {
        throw result.error;
      }
    } catch (err) {
      if (err.message === 'Invalid email or password') {
        return res.status(401).json({ error: err.message });
      }
      next(err);
    }
  },

  /**
   * Get current user with caching
   */
  async getMe(req, res, next) {
    try {
      const cacheKey = `user:${req.user.id}`;
      
      // Try cache first
      const cachedUser = await cacheUtils.get(cacheKey);
      if (cachedUser) {
        return res.json({
          ...cachedUser,
          cached: true
        });
      }
      
      // Fetch from DB with retry
      const result = await withRetry(async () => {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
          const error = new Error('User not found');
          error.status = 404;
          throw error;
        }
        return user;
      }, { maxRetries: 3 });
      
      if (result.success) {
        // Cache the user data
        await cacheUtils.set(cacheKey, result.data, USER_CACHE_TTL);
        res.json({
          ...result.data,
          cached: false
        });
      } else {
        if (result.error.status === 404) {
          return res.status(404).json({ error: 'User not found' });
        }
        throw result.error;
      }
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
