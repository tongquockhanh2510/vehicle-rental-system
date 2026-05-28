import { VehicleRepository } from '../repositories/VehicleRepository.js';
import { createClient } from 'redis';
import axios from 'axios';
import FormData from 'form-data';

const vehicleRepository = new VehicleRepository();
const redisClient = createClient({ url: process.env.REDIS_URL });
const CACHE_TTL_SECONDS = Number.parseInt(process.env.VEHICLE_CACHE_TTL || '120', 10);

redisClient.on('error', (err) => console.log('Redis Client Error', err.message));

try {
  await redisClient.connect();
  console.log('Connected to Redis');
} catch (error) {
  console.log('Redis unavailable, continue without cache:', error.message);
}

export class VehicleService {
  cacheEnabled() {
    return redisClient?.isOpen;
  }

  buildListCacheKey(prefix, payload) {
    return `${prefix}:${JSON.stringify(payload)}`;
  }

  async getFromCache(key) {
    if (!this.cacheEnabled()) {
      return null;
    }

    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.log('Redis get cache error:', err.message);
      return null;
    }
  }

  async setCache(key, data, ttl = CACHE_TTL_SECONDS) {
    if (!this.cacheEnabled()) {
      return;
    }

    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (err) {
      console.log('Redis set cache error:', err.message);
    }
  }

  async invalidateVehicleCaches() {
    if (!this.cacheEnabled()) {
      return;
    }

    try {
      const keys = [];
      for await (const key of redisClient.scanIterator({
        MATCH: 'vehicles:*',
        COUNT: 100
      })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (err) {
      console.log('Redis invalidate cache error:', err.message);
    }
  }

  normalizeImageFiles(files) {
    if (!files) {
      return [];
    }

    if (Array.isArray(files)) {
      return files;
    }

    return files.images || [];
  }

  async createVehicle(userId, vehicleData, files, authToken) {
    const imageFiles = this.normalizeImageFiles(files);
    if (imageFiles.length === 0) {
      throw new Error('Missing required image files');
    }

    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
        const response = await axios.post(`${process.env.IMAGE_SERVICE_URL}/api/images/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': authToken
          }
        });
        uploadedUrls.push(response.data.data.url);
      }

      const vehicle = await vehicleRepository.create({ ...vehicleData, owner_id: userId, images: uploadedUrls });
      await this.invalidateVehicleCaches();
      return vehicle;
    } catch (error) {
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }
  }

  async getVehicleById(vehicleId) {
    const cacheKey = `vehicles:detail:${vehicleId}`;

    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const vehicle = await vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    await this.setCache(cacheKey, vehicle, 3600);
    return vehicle;
  }

  async updateVehicle(vehicleId, updateData) {
    const vehicle = await vehicleRepository.update(vehicleId, updateData);

    await this.setCache(`vehicles:detail:${vehicleId}`, vehicle, 3600);
    await this.invalidateVehicleCaches();

    return vehicle;
  }

  async getOwnerVehicles(ownerId, page = 1, limit = 10, sort = '-created_at') {
    return await vehicleRepository.findByOwnerId(ownerId, page, limit, sort);
  }

  async getAvailableVehicles(filters = {}, page = 1, limit = 10, sort = '-created_at') {
    const keyword = filters.keyword || '';
    const cleanFilters = { ...filters };
    delete cleanFilters.keyword;

    const cacheKey = this.buildListCacheKey('vehicles:list:available', {
      filters: cleanFilters,
      keyword,
      page,
      limit,
      sort
    });

    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = keyword
      ? await vehicleRepository.searchVehicles({ is_available: true, ...cleanFilters }, keyword, page, limit, sort)
      : await vehicleRepository.findAvailable(cleanFilters, page, limit, sort);

    await this.setCache(cacheKey, result);
    return result;
  }

  async searchVehicles(filters = {}, page = 1, limit = 10, sort = '-created_at') {
    const keyword = filters.keyword || '';
    const cleanFilters = { ...filters };
    delete cleanFilters.keyword;

    const cacheKey = this.buildListCacheKey('vehicles:list:search', {
      filters: cleanFilters,
      keyword,
      page,
      limit,
      sort
    });

    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = keyword
      ? await vehicleRepository.searchVehicles(cleanFilters, keyword, page, limit, sort)
      : await vehicleRepository.findAll(cleanFilters, page, limit, sort);

    await this.setCache(cacheKey, result);
    return result;
  }

  async suggestKeywords(keyword, limit = 8) {
    const cacheKey = this.buildListCacheKey('vehicles:suggest', { keyword, limit });
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const suggestions = await vehicleRepository.suggestKeywords(keyword, limit);
    await this.setCache(cacheKey, suggestions);
    return suggestions;
  }

  async deleteVehicle(vehicleId, userId, authToken) {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    if(vehicle.owner_id.toString() !== userId) {
      throw new Error('Not authorized to delete this vehicle');
    }
    if (vehicle.images && vehicle.images.length > 0) {
      for (const imageUrl of vehicle.images) {
        try {
          await axios.delete(`${process.env.IMAGE_SERVICE_URL}/api/images/delete`, {
            data: { imageUrl },
            headers: {
              'Authorization': authToken
            }
          });
        } catch (err) {
          console.log('Error deleting image from service:', err.message);
        }
      }
    }
    const deleted = await vehicleRepository.delete(vehicleId);
    await this.invalidateVehicleCaches();
    if (this.cacheEnabled()) {
      try {
        await redisClient.del(`vehicles:detail:${vehicleId}`);
      } catch (err) {
        console.log('Redis detail cache delete error:', err.message);
      }
    }
    return deleted;
  }

  async addVehicleImages(vehicleId, files) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const imageFiles = this.normalizeImageFiles(files);
    if (imageFiles.length === 0) {
      throw new Error('No image files provided');
    }

    try {
      const imageServiceUrl = process.env.IMAGE_SERVICE_URL || `http://localhost:${process.env.IMAGE_SERVICE_PORT || 3005}`;
      const uploadedUrls = [];

      // Upload each file to image-service
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });

        const response = await axios.post(`${imageServiceUrl}/api/images/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'X-Service-Token': process.env.SERVICE_TOKEN || ''
          }
        });

        uploadedUrls.push(response.data.data.url);
      }

      // Update vehicle with new images
      const updatedImages = [...(vehicle.images || []), ...uploadedUrls];
      const updatedVehicle = await this.updateVehicle(vehicleId, { images: updatedImages });

      return updatedVehicle;
    } catch (error) {
      throw new Error(`Failed to upload vehicle images: ${error.message}`);
    }
  }

  async deleteVehicleImage(vehicleId, imageUrl) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    try {
      const imageServiceUrl = process.env.IMAGE_SERVICE_URL || `http://localhost:${process.env.IMAGE_SERVICE_PORT || 3005}`;

      // Delete image from image-service
      await axios.delete(`${imageServiceUrl}/api/images/delete`, {
        data: { imageUrl },
        headers: {
          'X-Service-Token': process.env.SERVICE_TOKEN || ''
        }
      });

      // Remove from vehicle's image list
      const updatedImages = (vehicle.images || []).filter(img => img !== imageUrl);
      const updatedVehicle = await this.updateVehicle(vehicleId, { images: updatedImages });

      return updatedVehicle;
    } catch (error) {
      throw new Error(`Failed to delete vehicle image: ${error.message}`);
    }
  }

  async updateAvailability(vehicleId, isAvailable) {
    const vehicle = await this.updateVehicle(vehicleId, { is_available: isAvailable });
    await this.invalidateVehicleCaches();
    return vehicle;
  }
}

export default new VehicleService();
