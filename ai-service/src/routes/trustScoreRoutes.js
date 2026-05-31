import express from 'express';
import { calculateTrustScore } from '../utils/trustScoreEngine.js';
import {
  getVehicleReviews,
  getRentalStats,
  getInspectionData,
  getOwnerData,
} from '../services/serviceClient.js';

const router = express.Router();

/**
 * POST /api/ai/trust-score/calculate
 * Calculate trust score for a vehicle and its owner.
 */
router.post('/calculate', async (req, res) => {
  try {
    const { vehicleId, ownerId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ error: 'vehicleId is required' });
    }

    // Fetch all data in parallel, gracefully handle failures
    const [reviews, rentalStats, inspectionData, ownerData] = await Promise.all([
      getVehicleReviews(vehicleId).catch(() => []),
      getRentalStats(vehicleId).catch(() => ({})),
      getInspectionData(vehicleId).catch(() => ({})),
      getOwnerData(ownerId).catch(() => ({})),
    ]);

    const result = calculateTrustScore({
      vehicleId,
      ownerId,
      reviews,
      rentalStats,
      inspectionData,
      ownerData,
    });

    return res.json(result);
  } catch (error) {
    console.error('[trust-score] Error:', error.message);
    return res.status(500).json({ error: 'Failed to calculate trust score', details: error.message });
  }
});

export default router;
