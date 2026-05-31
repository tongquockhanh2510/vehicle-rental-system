/**
 * aiClient.js
 * Calls ai-service for smart pricing and trust score.
 * All errors are caught and logged — never crash the main flow.
 */
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5010';
const REQUEST_TIMEOUT = 8000; // 8 seconds

/**
 * Request a smart pricing suggestion from ai-service.
 * @param {object} params
 * @returns {object|null} pricing result or null on failure
 */
export async function requestSmartPricing({
  vehicleId,
  vehicleType,
  location,
  basePrice,
  startDate,
  endDate,
}) {
  try {
    const today = new Date();
    const start = startDate || today.toISOString().split('T')[0];
    const end = endDate || new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/pricing/suggest`,
      {
        vehicleId,
        vehicleType,
        location,
        basePrice,
        startDate: start,
        endDate: end,
        smartPricingEnabled: true,
      },
      { timeout: REQUEST_TIMEOUT }
    );

    return response.data;
  } catch (err) {
    console.error(`[vehicle-service] ai-service pricing failed for vehicle ${vehicleId}:`, err.message);
    return null;
  }
}

/**
 * Request a trust score calculation from ai-service.
 * @param {string} vehicleId
 * @param {string} ownerId
 * @returns {object|null} trust score result or null on failure
 */
export async function requestTrustScore(vehicleId, ownerId) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/trust-score/calculate`,
      { vehicleId, ownerId },
      { timeout: REQUEST_TIMEOUT }
    );
    return response.data;
  } catch (err) {
    console.error(`[vehicle-service] ai-service trust score failed for vehicle ${vehicleId}:`, err.message);
    return null;
  }
}
