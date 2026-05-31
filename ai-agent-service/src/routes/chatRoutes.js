import express from 'express';
import { extractIntent } from '../utils/intentExtractor.js';
import {
  searchVehicles,
  rankVehicles,
  generateAlternatives,
} from '../services/vehicleSearchClient.js';

const router = express.Router();

/**
 * POST /api/ai-agent/chat
 * Natural language vehicle search assistant.
 */
router.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Step 1: Extract intent and slots from natural language
    const slots = extractIntent(message);

    if (slots.intent === 'UNKNOWN') {
      return res.json({
        message: "I'm sorry, I didn't understand your request. Could you please describe what type of vehicle you're looking for, where, and when?",
        intent: 'UNKNOWN',
        slots,
        vehicles: [],
        actions: [],
      });
    }

    // Step 2: Validate essential slots for search
    if (!slots.vehicleType && !slots.location) {
      return res.json({
        message: 'Could you provide more details? Please mention the vehicle type (e.g., 7-seat car, motorcycle) and your desired location.',
        intent: slots.intent,
        slots,
        vehicles: [],
        actions: [
          { type: 'CLARIFY', label: 'Provide more details' },
        ],
      });
    }

    // Step 3: Search vehicles
    const allVehicles = await searchVehicles(slots);

    // Step 4: Rank results
    if (allVehicles.length > 0) {
      const topVehicles = rankVehicles(allVehicles, slots);

      const typeLabel = slots.vehicleType
        ? slots.vehicleType.replace('_', '-').toLowerCase()
        : 'vehicle';
      const locationLabel = slots.location || 'your area';

      const responseMessage = topVehicles.length === 1
        ? `I found 1 suitable ${typeLabel} in ${locationLabel} for you.`
        : `I found ${topVehicles.length} suitable ${typeLabel}s in ${locationLabel} for you.`;

      return res.json({
        message: responseMessage,
        intent: slots.intent,
        slots,
        vehicles: topVehicles,
        actions: topVehicles.map((v) => ({
          type: 'BOOK_NOW',
          label: 'Confirm booking',
          vehicleId: v.id,
          bookingUrl: v.bookingUrl,
        })),
      });
    }

    // Step 5: No vehicles found - suggest alternatives
    const alternatives = generateAlternatives(slots);
    const locationLabel = slots.location || 'this area';

    return res.json({
      message: `Sorry, I couldn't find any available vehicles matching your criteria in ${locationLabel}. Here are some alternatives:`,
      intent: slots.intent,
      slots,
      vehicles: [],
      alternatives,
      actions: [
        { type: 'MODIFY_SEARCH', label: 'Modify search criteria' },
        { type: 'BROWSE_ALL', label: 'Browse all available vehicles', url: '/vehicles' },
      ],
    });
  } catch (error) {
    console.error('[ai-agent] /chat error:', error.message);
    return res.status(500).json({
      error: 'Failed to process your request',
      details: error.message,
    });
  }
});

/**
 * POST /api/ai-agent/extract-intent
 * Debug endpoint to test intent extraction without searching.
 */
router.post('/extract-intent', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  const slots = extractIntent(message);
  return res.json(slots);
});

export default router;
