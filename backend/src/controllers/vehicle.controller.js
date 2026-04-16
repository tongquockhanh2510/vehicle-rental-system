const VehicleModel = require('../models/vehicle.model');
const { cacheUtils } = require('../config/redis.config');
const { withRetry } = require('../middleware/retry.middleware');

const CACHE_TTL = 300; // 5 minutes

const VehicleController = {
  /**
   * Get all vehicles with Redis caching
   * Performance: Cache hit = ~1ms, Cache miss = ~50-100ms
   */
  async getAll(req, res, next) {
    try {
      const { type, status, search } = req.query;
      
      // Generate cache key based on query params
      const cacheKey = `vehicles:list:${JSON.stringify({ type, status, search })}`;
      
      // Try to get from cache first
      const cachedData = await cacheUtils.get(cacheKey);
      if (cachedData) {
        return res.json({
          ...cachedData,
          cached: true
        });
      }
      
      // Cache miss - fetch from database with retry
      const result = await withRetry(async () => {
        return await VehicleModel.findAll({ type, status, search });
      }, { maxRetries: 3 });
      
      if (result.success) {
        // Store in cache
        await cacheUtils.set(cacheKey, result.data, CACHE_TTL);
        
        res.json({
          ...result.data,
          cached: false
        });
      } else {
        throw result.error;
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single vehicle by ID with Redis caching
   * Performance: Cache hit = ~1ms, Cache miss = ~20-50ms
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `vehicles:single:${id}`;
      
      // Try cache first
      const cachedData = await cacheUtils.get(cacheKey);
      if (cachedData) {
        return res.json({
          ...cachedData,
          cached: true
        });
      }
      
      // Fetch from DB with retry
      const result = await withRetry(async () => {
        const vehicle = await VehicleModel.findById(id);
        if (!vehicle) {
          const error = new Error('Vehicle not found');
          error.status = 404;
          throw error;
        }
        return vehicle;
      }, { maxRetries: 3 });
      
      if (result.success) {
        await cacheUtils.set(cacheKey, result.data, CACHE_TTL);
        res.json({
          ...result.data,
          cached: false
        });
      } else {
        if (result.error.status === 404) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        throw result.error;
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new vehicle - clear cache
   */
  async create(req, res, next) {
    try {
      const vehicle = await VehicleModel.create({
        owner_id: req.user.id,
        ...req.body
      });
      
      // Clear vehicles list cache since new vehicle added
      await cacheUtils.delPattern('vehicles:list:*');
      
      res.status(201).json(vehicle);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update vehicle - clear cache
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleModel.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (vehicle.owner_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this vehicle' });
      }

      const updated = await VehicleModel.update(id, req.body);
      
      // Clear relevant caches
      await cacheUtils.del(`vehicles:single:${id}`);
      await cacheUtils.delPattern('vehicles:list:*');
      
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete vehicle - clear cache
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleModel.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (vehicle.owner_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this vehicle' });
      }

      await VehicleModel.delete(id);
      
      // Clear all related caches
      await cacheUtils.del(`vehicles:single:${id}`);
      await cacheUtils.delPattern('vehicles:list:*');
      
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getMyVehicles(req, res, next) {
    try {
      const vehicles = await VehicleModel.getByOwner(req.user.id);
      res.json(vehicles);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = VehicleController;
