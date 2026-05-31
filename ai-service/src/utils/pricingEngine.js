/**
 * pricingEngine.js
 * Rule-based smart pricing engine.
 * Designed to be replaceable by a real ML Regression model later.
 */

// Vietnamese public holidays (MM-DD format)
const VN_HOLIDAYS = [
  '01-01', // New Year
  '04-30', // Liberation Day
  '05-01', // International Labor Day
  '09-02', // National Day
];

// Tet ranges (approximate lunar - solar mapping for 2025-2027)
const TET_RANGES = [
  { start: '2026-01-25', end: '2026-02-05' },
  { start: '2027-02-13', end: '2027-02-22' },
  { start: '2025-01-27', end: '2025-02-06' },
];

// High-demand areas (partial match)
const HIGH_DEMAND_AREAS = [
  'hội an', 'hoi an',
  'đà lạt', 'da lat', 'dalat',
  'phú quốc', 'phu quoc',
  'nha trang',
  'sapa', 'sa pa',
  'đà nẵng', 'da nang',
  'hạ long', 'ha long',
  'mũi né', 'mui ne',
  'buôn ma thuột', 'buon ma thuot',
  'ea súp', 'ea sup',
];

// Multiplier lookup by vehicle type
const VEHICLE_TYPE_MULTIPLIER = {
  CAR: 1.0,
  MOTORCYCLE: 0.6,
  BICYCLE: 0.4,
  PICKUP_TRUCK: 1.2,
  SEVEN_SEATER: 1.15,
  OTHER: 1.0,
};

/**
 * Check if a date is a weekend.
 * @param {Date} date
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if any date in the range is a weekend.
 * @param {Date} start
 * @param {Date} end
 */
function rangeIncludesWeekend(start, end) {
  const cursor = new Date(start);
  while (cursor <= end) {
    if (isWeekend(cursor)) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

/**
 * Check if any date in the range is a Vietnamese public holiday.
 */
function rangeIncludesHoliday(start, end) {
  const cursor = new Date(start);
  while (cursor <= end) {
    const mmdd = `${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (VN_HOLIDAYS.includes(mmdd)) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

/**
 * Check if any date in the range falls in Tet season.
 */
function rangeIncludesTet(start, end) {
  for (const tet of TET_RANGES) {
    const tetStart = new Date(tet.start);
    const tetEnd = new Date(tet.end);
    if (start <= tetEnd && end >= tetStart) return true;
  }
  return false;
}

/**
 * Check if the location is a high-demand area.
 * @param {string} location
 */
function isHighDemandArea(location) {
  if (!location) return false;
  const lower = location.toLowerCase();
  return HIGH_DEMAND_AREAS.some((area) => lower.includes(area));
}

/**
 * Main pricing suggestion function.
 *
 * @param {object} params
 * @param {string} params.vehicleId
 * @param {string} params.vehicleType  - e.g. 'SEVEN_SEATER', 'CAR', 'PICKUP_TRUCK'
 * @param {string} params.location
 * @param {number} params.basePrice    - VND per day
 * @param {string} params.startDate    - ISO date string
 * @param {string} params.endDate      - ISO date string
 * @param {object} [params.stats]      - optional data from statistic-service
 * @returns {object} pricing suggestion
 */
export function calculateSuggestedPrice({
  vehicleId,
  vehicleType,
  location,
  basePrice,
  startDate,
  endDate,
  stats = {},
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const reasons = [];
  let multiplier = 1.0;

  // --- Factor 1: Vehicle type ---
  const typeKey = String(vehicleType || 'CAR').toUpperCase();
  const typeMult = VEHICLE_TYPE_MULTIPLIER[typeKey] || 1.0;
  if (typeMult !== 1.0) {
    reasons.push(`Vehicle type ${typeKey} has a base multiplier of ${typeMult}.`);
  }

  // --- Factor 2: Weekend ---
  const hasWeekend = rangeIncludesWeekend(start, end);
  if (hasWeekend) {
    multiplier += 0.2;
    reasons.push('Date range includes weekend — demand is higher.');
  }

  // --- Factor 3: Holiday ---
  const hasHoliday = rangeIncludesHoliday(start, end);
  if (hasHoliday) {
    multiplier += 0.25;
    reasons.push('Date range includes a Vietnamese public holiday.');
  }

  // --- Factor 4: Tet ---
  const hasTet = rangeIncludesTet(start, end);
  if (hasTet) {
    multiplier += 0.35;
    reasons.push('Date range falls in Tết season — peak demand.');
  }

  // --- Factor 5: High-demand area ---
  const highDemand = isHighDemandArea(location);
  if (highDemand) {
    multiplier += 0.15;
    reasons.push(`Location "${location}" is a high-demand tourist area.`);
  }

  // --- Factor 6: Historical average price from statistic-service ---
  let avgMarketPrice = null;
  if (stats && stats.averagePrice && stats.averagePrice > 0) {
    avgMarketPrice = stats.averagePrice;
    const marketDiff = (avgMarketPrice - basePrice) / basePrice;
    if (marketDiff > 0.1) {
      multiplier += Math.min(marketDiff, 0.3);
      reasons.push(
        `Market average for similar vehicles in this area is ${avgMarketPrice.toLocaleString('vi-VN')} VND/day — above your base price.`
      );
    } else if (marketDiff < -0.1) {
      multiplier -= Math.min(Math.abs(marketDiff), 0.15);
      reasons.push(
        `Market average is ${avgMarketPrice.toLocaleString('vi-VN')} VND/day — slightly below your base price.`
      );
    }
  }

  // --- Factor 7: Booking count / demand ---
  if (stats && stats.bookingCount > 50) {
    multiplier += 0.05;
    reasons.push(`High rental frequency: ${stats.bookingCount} bookings in this area.`);
  }

  // --- Factor 8: Cancellation rate ---
  if (stats && stats.cancellationRate > 0.3) {
    multiplier -= 0.05;
    reasons.push(`High cancellation rate (${Math.round(stats.cancellationRate * 100)}%) may indicate price sensitivity.`);
  }

  // --- Apply multipliers ---
  const weekendPrice = Math.round(basePrice * typeMult * 1.2 / 1000) * 1000;
  const normalDayPrice = Math.round(basePrice * typeMult / 1000) * 1000;
  const suggestedPrice = Math.round(basePrice * typeMult * multiplier / 1000) * 1000;

  // --- Confidence score (0 to 1) ---
  // Higher when we have market data, lower when pure rule-based
  let confidence = 0.65;
  if (avgMarketPrice) confidence += 0.12;
  if (stats && stats.bookingCount > 10) confidence += 0.08;
  confidence = Math.min(confidence, 0.95);

  const reasonText = reasons.length > 0
    ? reasons.join(' ')
    : `Base price for a ${typeKey} in ${location || 'the selected area'}.`;

  return {
    vehicleId,
    basePrice,
    suggestedPrice,
    normalDayPrice,
    weekendPrice,
    confidence: Math.round(confidence * 100) / 100,
    reason: reasonText,
    factors: {
      hasWeekend,
      hasHoliday,
      hasTet,
      highDemand,
      vehicleTypeMultiplier: typeMult,
      finalMultiplier: Math.round(multiplier * 100) / 100,
    },
  };
}
