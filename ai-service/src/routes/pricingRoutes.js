import express from 'express';
import { calculateSuggestedPrice } from '../utils/pricingEngine.js';
import { getStatistics } from '../services/serviceClient.js';

const router = express.Router();

/**
 * POST /api/ai/pricing/suggest
 * Suggest a smart rental price for a vehicle.
 */
router.post('/suggest', async (req, res) => {
  try {
    const { vehicleId, vehicleType, location, basePrice, startDate, endDate, smartPricingEnabled } = req.body;

    // Validation
    if (!basePrice || isNaN(Number(basePrice))) {
      return res.status(400).json({ error: 'basePrice is required and must be a number' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'startDate must be before endDate' });
    }
    if (!smartPricingEnabled) {
      // If smart pricing is disabled, just return base price
      return res.json({
        vehicleId,
        basePrice: Number(basePrice),
        suggestedPrice: Number(basePrice),
        normalDayPrice: Number(basePrice),
        weekendPrice: Number(basePrice),
        confidence: 1.0,
        reason: 'Smart pricing is disabled. Using base price.',
      });
    }

    // Fetch market statistics from statistic-service (non-blocking)
    let stats = {};
    try {
      stats = await getStatistics({ location, vehicleType });
    } catch (err) {
      console.warn('[pricing] Could not fetch stats, using rule-based only:', err.message);
    }

    const result = calculateSuggestedPrice({
      vehicleId,
      vehicleType,
      location,
      basePrice: Number(basePrice),
      startDate,
      endDate,
      stats,
    });

    return res.json(result);
  } catch (error) {
    console.error('[pricing] Error:', error.message);
    return res.status(500).json({ error: 'Failed to calculate suggested price', details: error.message });
  }
});

export default router;
