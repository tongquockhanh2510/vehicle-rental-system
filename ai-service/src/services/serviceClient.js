import axios from 'axios';

const SERVICES = {
  statistic: process.env.STATISTIC_SERVICE_URL || 'http://localhost:3011',
  review: process.env.REVIEW_SERVICE_URL || 'http://localhost:3009',
  rental: process.env.RENTAL_SERVICE_URL || 'http://localhost:3003',
  inspection: process.env.INSPECTION_SERVICE_URL || 'http://localhost:3012',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
};

const REQUEST_TIMEOUT = 5000; // ms

/**
 * Fetch JSON from a service with a timeout.
 * Returns null on error instead of throwing.
 */
async function safeGet(url, label) {
  try {
    const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });
    return response.data;
  } catch (err) {
    console.warn(`[ai-service] Failed to fetch ${label} from ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Get statistics for a vehicle/location/type from statistic-service.
 */
export async function getStatistics({ location, vehicleType }) {
  const params = new URLSearchParams();
  if (location) params.set('location', location);
  if (vehicleType) params.set('vehicle_type', vehicleType);

  const url = `${SERVICES.statistic}/api/statistics/pricing-context?${params.toString()}`;
  const data = await safeGet(url, 'statistic-service pricing-context');

  if (!data) return {};

  // Normalize different response shapes
  const payload = data.data || data;
  return {
    averagePrice: Number(payload.average_price || payload.averagePrice || 0),
    bookingCount: Number(payload.booking_count || payload.bookingCount || 0),
    cancellationRate: Number(payload.cancellation_rate || payload.cancellationRate || 0),
    peakDates: payload.peak_dates || payload.peakDates || [],
  };
}

/**
 * Get all reviews for a vehicle from review-service.
 */
export async function getVehicleReviews(vehicleId) {
  const url = `${SERVICES.review}/api/reviews/vehicle/${vehicleId}?limit=100`;
  const data = await safeGet(url, `review-service vehicle=${vehicleId}`);

  if (!data) return [];

  const payload = data.data || data;
  return Array.isArray(payload) ? payload : (payload.reviews || payload.data || []);
}

/**
 * Get rental stats for a vehicle from rental-service.
 */
export async function getRentalStats(vehicleId) {
  const url = `${SERVICES.rental}/api/rentals/stats/vehicle/${vehicleId}`;
  const data = await safeGet(url, `rental-service vehicle=${vehicleId}`);

  if (!data) return {};

  const payload = data.data || data;
  return {
    completed: Number(payload.completed || payload.completed_count || 0),
    cancelled: Number(payload.cancelled || payload.cancelled_count || 0),
    lateHandovers: Number(payload.late_handovers || payload.lateHandovers || 0),
  };
}

/**
 * Get inspection data for a vehicle from inspection-service.
 */
export async function getInspectionData(vehicleId) {
  const url = `${SERVICES.inspection}/api/inspections/vehicle/${vehicleId}/summary`;
  const data = await safeGet(url, `inspection-service vehicle=${vehicleId}`);

  if (!data) return {};

  const payload = data.data || data;
  return {
    maintenanceCount: Number(payload.maintenance_count || payload.maintenanceCount || 0),
    damageReports: Number(payload.damage_reports || payload.damageReports || 0),
    inspectionStatus: payload.status || payload.inspection_status || 'UNKNOWN',
  };
}

/**
 * Get owner data from user-service.
 */
export async function getOwnerData(ownerId) {
  if (!ownerId) return {};
  const url = `${SERVICES.user}/api/users/${ownerId}`;
  const data = await safeGet(url, `user-service owner=${ownerId}`);

  if (!data) return {};

  const payload = data.data || data;
  return {
    isVerified: payload.is_verified === true,
    owner_status: payload.owner_status || '',
  };
}
