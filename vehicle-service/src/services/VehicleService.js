import { VehicleRepository } from '../repositories/VehicleRepository.js';
import { createClient } from 'redis';

const vehicleRepository = new VehicleRepository();
const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

export class VehicleService {
  async createVehicle(vehicleData) {
    const vehicle = await vehicleRepository.create(vehicleData);
    return vehicle;
  }

  async getVehicleById(vehicleId) {
    const cacheKey = `vehicle:${vehicleId}`;
    
    // Try to get from cache
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.log('Redis error:', err);
    }

    const vehicle = await vehicleRepository.findById(vehicleId);
    
    // Cache the result
    if (vehicle) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(vehicle));
      } catch (err) {
        console.log('Redis cache error:', err);
      }
    }

    return vehicle;
  }

  async updateVehicle(vehicleId, updateData) {
    const vehicle = await vehicleRepository.update(vehicleId, updateData);
    
    // Invalidate cache
    const cacheKey = `vehicle:${vehicleId}`;
    try {
      await redisClient.del(cacheKey);
    } catch (err) {
      console.log('Redis cache delete error:', err);
    }

    return vehicle;
  }

  async getOwnerVehicles(ownerId) {
    return await vehicleRepository.findByOwnerId(ownerId);
  }

  async getAvailableVehicles(filters = {}) {
    return await vehicleRepository.findAvailable(filters);
  }

  async searchVehicles(filters = {}) {
    return await vehicleRepository.findAll(filters);
  }

  async deleteVehicle(vehicleId) {
    const cacheKey = `vehicle:${vehicleId}`;
    try {
      await redisClient.del(cacheKey);
    } catch (err) {
      console.log('Redis cache delete error:', err);
    }
    return await vehicleRepository.delete(vehicleId);
  }

  async addVehicleImages(vehicleId, imageUrls) {
    const vehicle = await this.getVehicleById(vehicleId);
    const updatedImages = [...(vehicle.images || []), ...imageUrls];
    return await this.updateVehicle(vehicleId, { images: updatedImages });
  }

  async updateAvailability(vehicleId, isAvailable) {
    return await this.updateVehicle(vehicleId, { is_available: isAvailable });
  }
}

export default new VehicleService();
