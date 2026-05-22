import express from 'express';
import rentalService from '../services/RentalService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/request', authenticateToken, async (req, res) => {
  try {
    const rentalRequest = await rentalService.createRentalRequest({
      ...req.body,
      renter_id: req.userId
    });
    res.status(201).json(rentalRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:rentalId', async (req, res) => {
  try {
    const rental = await rentalService.getRentalById(req.params.rentalId);
    res.json(rental);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:rentalId/confirm', async (req, res) => {
  try {
    const rental = await rentalService.confirmRental(req.params.rentalId);
    res.json(rental);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:rentalId/reject', async (req, res) => {
  try {
    const rental = await rentalService.rejectRental(req.params.rentalId, req.body.reason);
    res.json(rental);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:rentalId/cancel', async (req, res) => {
  try {
    const rental = await rentalService.cancelRental(req.params.rentalId);
    res.json(rental);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/renter/my-rentals', authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getRenterRentals(req.userId);
    res.json(rentals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/owner/my-rentals', authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getOwnerRentals(req.userId);
    res.json(rentals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/check-availability', async (req, res) => {
  try {
    const available = await rentalService.checkAvailability(
      req.body.vehicle_id,
      req.body.start_date,
      req.body.end_date
    );
    res.json({ available });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
