import express from 'express';
import trackingService from '../services/TrackingService.js';

const router = express.Router();

router.post('/update-location', async (req, res) => {
  try {
    const location = await trackingService.updateLocation(
      req.body.vehicle_id,
      req.body.rental_request_id,
      req.body.latitude,
      req.body.longitude,
      req.body.address,
      req.body.allowed_regions
    );
    res.json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:vehicleId/latest', async (req, res) => {
  try {
    const location = await trackingService.getLatestLocation(req.params.vehicleId);
    res.json(location);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/:vehicleId/history', async (req, res) => {
  try {
    const history = await trackingService.getLocationHistory(
      req.params.vehicleId,
      new Date(req.query.start_date),
      new Date(req.query.end_date)
    );
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/record-movement', async (req, res) => {
  try {
    const movement = await trackingService.recordMovement(
      req.body.vehicle_id,
      req.body.rental_request_id,
      req.body.start_location,
      req.body.end_location,
      req.body.distance_km,
      req.body.duration_minutes
    );
    res.json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:vehicleId/movement-history', async (req, res) => {
  try {
    const history = await trackingService.getMovementHistory(
      req.params.vehicleId,
      new Date(req.query.start_date),
      new Date(req.query.end_date)
    );
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
