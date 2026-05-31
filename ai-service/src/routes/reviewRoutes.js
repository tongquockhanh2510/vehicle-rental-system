import express from 'express';
import { summarizeReviews } from '../utils/reviewSummarizer.js';
import { getVehicleReviews } from '../services/serviceClient.js';

const router = express.Router();

// In-memory cache for review summaries (keyed by vehicleId)
// TTL: 24 hours
const summaryCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached(vehicleId) {
  const entry = summaryCache.get(vehicleId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    summaryCache.delete(vehicleId);
    return null;
  }
  return entry.data;
}

function setCache(vehicleId, data) {
  summaryCache.set(vehicleId, { data, timestamp: Date.now() });
}

/**
 * POST /api/ai/reviews/summarize
 * Generate an AI summary of all reviews for a vehicle.
 */
router.post('/summarize', async (req, res) => {
  try {
    const { vehicleId, forceRefresh } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ error: 'vehicleId is required' });
    }

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cached = getCached(vehicleId);
      if (cached) {
        return res.json({ ...cached, fromCache: true });
      }
    }

    // Fetch reviews from review-service
    let reviews = [];
    try {
      reviews = await getVehicleReviews(vehicleId);
    } catch (err) {
      console.warn('[reviews] Could not fetch reviews:', err.message);
    }

    const summary = await summarizeReviews(vehicleId, reviews);
    setCache(vehicleId, summary);

    return res.json(summary);
  } catch (error) {
    console.error('[reviews] Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate review summary', details: error.message });
  }
});

/**
 * DELETE /api/ai/reviews/cache/:vehicleId
 * Invalidate the summary cache for a vehicle (called when new review is added).
 */
router.delete('/cache/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  summaryCache.delete(vehicleId);
  return res.json({ message: `Cache cleared for vehicle ${vehicleId}` });
});

export default router;
