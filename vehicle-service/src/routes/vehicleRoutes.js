import express from 'express';
import vehicleService from '../services/VehicleService.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/', authenticateToken, upload.fields([{ name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(
      req.userId,
      {
        ...req.body
      },
      req.files?.images || [],
      req.headers.authorization
    );
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:vehicleId', async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
    res.json(vehicle);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:vehicleId', authenticateToken, async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);

    if (vehicle.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this vehicle' });
    }

    const updatedVehicle = await vehicleService.updateVehicle(req.params.vehicleId, req.body);
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/owner/:ownerId/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-created_at';

    const result = await vehicleService.getOwnerVehicles(req.params.ownerId, page, limit, sort);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/available/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-created_at';

    // Extract filters from query params
    const filters = {};
    if (req.query.q) filters.keyword = req.query.q;
    if (req.query.vehicle_type) filters.vehicle_type = req.query.vehicle_type;
    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.fuel_type) filters.fuel_type = req.query.fuel_type;
    if (req.query.transmission) filters.transmission = req.query.transmission;
    if (req.query.city) filters.city = req.query.city;
    if (req.query.district) filters.district = req.query.district;
    if (req.query.allowed_region) filters.allowed_region = req.query.allowed_region;
    if (req.query.location) {
      const locationRegex = { $regex: req.query.location, $options: 'i' };
      filters.$or = [
        { pickup_location: locationRegex },
        { return_location: locationRegex },
        { city: locationRegex },
        { district: locationRegex },
        { allowed_region: locationRegex }
      ];
    }
    if (req.query.min_seats || req.query.max_seats) {
      filters.seats = {};
      if (req.query.min_seats) filters.seats.$gte = parseInt(req.query.min_seats);
      if (req.query.max_seats) filters.seats.$lte = parseInt(req.query.max_seats);
    }
    if (req.query.min_price || req.query.max_price) {
      filters.daily_rate = {};
      if (req.query.min_price) filters.daily_rate.$gte = parseInt(req.query.min_price);
      if (req.query.max_price) filters.daily_rate.$lte = parseInt(req.query.max_price);
    }

    const result = await vehicleService.getAvailableVehicles(filters, page, limit, sort);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/search/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-created_at';

    const filters = {};
    if (req.query.q) filters.keyword = req.query.q;
    if (req.query.vehicle_type) filters.vehicle_type = req.query.vehicle_type;
    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.fuel_type) filters.fuel_type = req.query.fuel_type;
    if (req.query.transmission) filters.transmission = req.query.transmission;
    if (req.query.city) filters.city = req.query.city;
    if (req.query.district) filters.district = req.query.district;
    if (req.query.allowed_region) filters.allowed_region = req.query.allowed_region;
    if (req.query.location) {
      const locationRegex = { $regex: req.query.location, $options: 'i' };
      filters.$or = [
        { pickup_location: locationRegex },
        { return_location: locationRegex },
        { city: locationRegex },
        { district: locationRegex },
        { allowed_region: locationRegex }
      ];
    }
    if (req.query.is_available === 'true') filters.is_available = true;
    if (req.query.is_available === 'false') filters.is_available = false;
    if (req.query.min_price || req.query.max_price) {
      filters.daily_rate = {};
      if (req.query.min_price) filters.daily_rate.$gte = parseInt(req.query.min_price);
      if (req.query.max_price) filters.daily_rate.$lte = parseInt(req.query.max_price);
    }

    const result = await vehicleService.searchVehicles(filters, page, limit, sort);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/search/suggestions', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const limit = parseInt(req.query.limit) || 8;
    const suggestions = await vehicleService.suggestKeywords(keyword, limit);
    res.json({ data: suggestions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:vehicleId/images', authenticateToken, upload.fields([{ name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);

    // Check if user is the owner
    if (vehicle.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to add images to this vehicle' });
    }

    const updatedVehicle = await vehicleService.addVehicleImages(req.params.vehicleId, req.files);
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:vehicleId/images/:imageIndex', authenticateToken, async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);

    // Check if user is the owner
    if (vehicle.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete images from this vehicle' });
    }

    const imageUrl = vehicle.images[parseInt(req.params.imageIndex)];
    if (!imageUrl) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const updatedVehicle = await vehicleService.deleteVehicleImage(req.params.vehicleId, imageUrl);
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:vehicleId/availability', async (req, res) => {
  try {
    const vehicle = await vehicleService.updateAvailability(req.params.vehicleId, req.body.is_available);
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:vehicleId', authenticateToken, async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.vehicleId, req.userId, req.headers.authorization);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
