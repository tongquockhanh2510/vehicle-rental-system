import express from 'express';
import vehicleService from '../services/VehicleService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle({
      ...req.body,
      owner_id: req.userId
    });
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
    const vehicle = await vehicleService.updateVehicle(req.params.vehicleId, req.body);
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/owner/:ownerId/list', async (req, res) => {
  try {
    const vehicles = await vehicleService.getOwnerVehicles(req.params.ownerId);
    res.json(vehicles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/available/list', async (req, res) => {
  try {
    const vehicles = await vehicleService.getAvailableVehicles(req.query);
    res.json(vehicles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:vehicleId/images', authenticateToken, async (req, res) => {
  try {
    const vehicle = await vehicleService.addVehicleImages(req.params.vehicleId, req.body.images);
    res.json(vehicle);
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
    await vehicleService.deleteVehicle(req.params.vehicleId);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
