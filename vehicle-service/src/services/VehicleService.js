import { VehicleRepository } from '../repositories/VehicleRepository.js';
import { createClient } from 'redis';
import axios from 'axios';
import FormData from 'form-data';

const vehicleRepository = new VehicleRepository();
console.log('Redis URL:', process.env.REDIS_URL);
const redisClient = createClient({url: process.env.REDIS_URL});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

export class VehicleService {
  async createVehicle(userId, vehicleData, files, authToken) {
    if (!files || files.length === 0) {
      throw new Error('Missing required image files');
    }
    try {
      ;
      const uploadedUrls = [];
      for (const file of files) {
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
      return vehicle;
    } catch (error) {
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }
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

  async getOwnerVehicles(ownerId, page = 1, limit = 10, sort = '-created_at') {
    return await vehicleRepository.findByOwnerId(ownerId, page, limit, sort);
  }

  async getAvailableVehicles(filters = {}, page = 1, limit = 10, sort = '-created_at') {
    return await vehicleRepository.findAvailable(filters, page, limit, sort);
  }

  async searchVehicles(filters = {}, page = 1, limit = 10, sort = '-created_at') {
    return await vehicleRepository.findAll(filters, page, limit, sort);
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
    const cacheKey = `vehicle:${vehicleId}`;
    try {
      await redisClient.del(cacheKey);
    } catch (err) {
      console.log('Redis cache delete error:', err);
    }
    return await vehicleRepository.delete(vehicleId);
  }

  async addVehicleImages(vehicleId, files) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (!files || files.length === 0) {
      throw new Error('No image files provided');
    }

    try {
      const imageServiceUrl = process.env.IMAGE_SERVICE_URL || `http://localhost:${process.env.IMAGE_SERVICE_PORT || 3005}`;
      const uploadedUrls = [];

      // Upload each file to image-service
      for (const file of files) {
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
    return await this.updateVehicle(vehicleId, { is_available: isAvailable });
  }
}

export default new VehicleService();
