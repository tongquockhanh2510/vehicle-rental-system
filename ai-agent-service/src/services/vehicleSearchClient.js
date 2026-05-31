/**
 * vehicleSearchClient.js
 * Calls vehicle-service to search for available vehicles.
 */
import axios from 'axios';

const VEHICLE_SERVICE_URL = process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002';
const REQUEST_TIMEOUT = 8000;

/**
 * Search vehicles based on extracted slots.
 * @param {object} slots
 * @returns {Array} matching vehicles (empty array on error)
 */
export async function searchVehicles(slots) {
  const params = new URLSearchParams();

  if (slots.vehicleType) {
    params.set('vehicle_type', slots.vehicleType);
  }
  if (slots.location) {
    params.set('location', slots.location);
  }
  if (slots.maxPrice) {
    params.set('max_price', slots.maxPrice);
  }
  if (slots.startDate) {
    params.set('startDate', slots.startDate);
  }
  if (slots.endDate) {
    params.set('endDate', slots.endDate);
  }

  params.set('limit', '10');
  params.set('sort', '-average_rating');

  try {
    const url = `${VEHICLE_SERVICE_URL}/api/vehicles/available/list?${params.toString()}`;
    const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });
    const payload = response.data;

    // Normalize different vehicle-service response shapes
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;

    return [];
  } catch (err) {
    console.error('[ai-agent] vehicle-service search failed:', err.message);
    return [];
  }
}

/**
 * Score and rank vehicles for best recommendation.
 * @param {Array} vehicles
 * @param {object} slots
 * @returns {Array} top 3 ranked vehicles
 */
export function rankVehicles(vehicles, slots) {
  const scored = vehicles.map((v) => {
    let score = 0;

    // Rating: up to 50 points
    score += (Number(v.average_rating) || 0) * 10;

    // Trust score: up to 20 points
    score += (Number(v.trust_score) || 50) * 0.2;

    // Price proximity to maxPrice: up to 20 points
    if (slots.maxPrice && v.daily_rate) {
      const priceDiff = slots.maxPrice - v.daily_rate;
      if (priceDiff >= 0) {
        score += Math.min(priceDiff / slots.maxPrice, 1) * 20;
      } else {
        score -= 10; // over budget, penalize
      }
    }

    // Availability: bonus
    if (v.is_available) score += 5;

    return { ...v, _aiScore: score };
  });

  return scored
    .sort((a, b) => b._aiScore - a._aiScore)
    .slice(0, 3)
    .map(({ _aiScore, ...v }) => ({
      id: v._id || v.id,
      name: `${v.brand || ''} ${v.model || ''}`.trim(),
      vehicleType: v.vehicle_type,
      pricePerDay: v.daily_rate,
      rating: v.average_rating,
      trustScore: v.trust_score || null,
      imageUrl: (v.images && v.images[0]) || null,
      location: v.pickup_location,
      bookingUrl: `/vehicles/${v._id || v.id}/booking`,
    }));
}

/**
 * Generate alternative search suggestions when no vehicles found.
 */
export function generateAlternatives(slots) {
  const alternatives = [];

  if (slots.maxPrice) {
    alternatives.push({
      type: 'HIGHER_BUDGET',
      message: `Try increasing your budget to ${Math.round(slots.maxPrice * 1.3 / 100000) * 100000} VND/day.`,
      slots: { ...slots, maxPrice: Math.round(slots.maxPrice * 1.3) },
    });
  }

  if (slots.vehicleType === 'SEVEN_SEATER') {
    alternatives.push({
      type: 'DIFFERENT_TYPE',
      message: 'Consider a 4-seat car which might be more available and affordable.',
      slots: { ...slots, vehicleType: 'CAR' },
    });
  }

  if (slots.startDate && slots.endDate) {
    alternatives.push({
      type: 'DIFFERENT_DATE',
      message: 'Weekday rentals are often cheaper. Try Monday to Thursday.',
      slots: { ...slots },
    });
  }

  if (slots.location) {
    alternatives.push({
      type: 'NEARBY_LOCATION',
      message: `Try searching in a nearby city or district.`,
      slots: { ...slots, location: null },
    });
  }

  return alternatives;
}
