/**
 * trustScoreEngine.js
 * Calculates a Trust Score (1–100) for a vehicle + owner combination.
 *
 * Scoring formula:
 *   - Review sentiment:            35%
 *   - Average rating:              20%
 *   - Cancellation rate:           15%
 *   - Maintenance/inspection:      15%
 *   - Completed rental history:    10%
 *   - Owner verification:           5%
 */

/**
 * Clamp a value between min and max.
 */
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Simple sentiment scorer (shared logic - returns 0..1).
 */
const POSITIVE_WORDS = [
  'tốt', 'tuyệt', 'hài lòng', 'sạch', 'đúng giờ', 'thân thiện', 'chuyên nghiệp',
  'good', 'great', 'excellent', 'clean', 'on time', 'friendly', 'professional',
  'reliable', 'smooth', 'comfortable', 'punctual',
];
const NEGATIVE_WORDS = [
  'tệ', 'kém', 'bẩn', 'trễ', 'hỏng', 'thất vọng', 'chậm', 'khó',
  'bad', 'poor', 'dirty', 'late', 'broken', 'disappointing', 'slow', 'unreliable',
];

function sentimentScore(reviews = []) {
  if (reviews.length === 0) return 0.5; // neutral default

  let total = 0;
  let count = 0;

  for (const review of reviews) {
    const text = (review.comment || review.text || '').toLowerCase();
    let pos = 0;
    let neg = 0;

    for (const w of POSITIVE_WORDS) {
      if (text.includes(w)) pos++;
    }
    for (const w of NEGATIVE_WORDS) {
      if (text.includes(w)) neg++;
    }

    const sum = pos + neg;
    if (sum > 0) {
      total += pos / sum;
      count++;
    } else {
      // No keywords - use rating as fallback
      const rating = review.rating || 3;
      total += (rating - 1) / 4; // scale 1..5 → 0..1
      count++;
    }
  }

  return count > 0 ? total / count : 0.5;
}

/**
 * Calculate trust score.
 *
 * @param {object} data
 * @param {string} data.vehicleId
 * @param {string} data.ownerId
 * @param {Array}  data.reviews             - [{rating, comment}]
 * @param {object} data.rentalStats         - {completed, cancelled, lateHandovers}
 * @param {object} data.inspectionData      - {maintenanceCount, damageReports, inspectionStatus}
 * @param {object} data.ownerData           - {isVerified}
 * @returns {object} trust score result
 */
export function calculateTrustScore({
  vehicleId,
  ownerId,
  reviews = [],
  rentalStats = {},
  inspectionData = {},
  ownerData = {},
}) {
  const details = {};

  // ============================================================
  // 1. Review Sentiment: 35 points
  // ============================================================
  const sentiment = sentimentScore(reviews);
  const sentimentPoints = clamp(Math.round(sentiment * 35), 0, 35);
  details.sentiment = sentimentPoints;

  // ============================================================
  // 2. Average Rating: 20 points
  // ============================================================
  let avgRatingPoints = 10; // neutral
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((s, r) => s + (r.rating || 3), 0) / reviews.length;
    // 1 star → 0 pts, 5 stars → 20 pts
    avgRatingPoints = clamp(Math.round(((avgRating - 1) / 4) * 20), 0, 20);
  }
  details.averageRating = avgRatingPoints;

  // ============================================================
  // 3. Cancellation Rate: 15 points (lower is better)
  // ============================================================
  const completed = Number(rentalStats.completed || 0);
  const cancelled = Number(rentalStats.cancelled || 0);
  const totalRentals = completed + cancelled;

  let cancellationPoints = 12; // default decent score
  if (totalRentals > 0) {
    const cancelRate = cancelled / totalRentals;
    // 0% cancel → 15 pts, 50%+ cancel → 0 pts
    cancellationPoints = clamp(Math.round((1 - cancelRate * 2) * 15), 0, 15);
  }
  details.cancellationRate = cancellationPoints;

  // ============================================================
  // 4. Maintenance / Inspection: 15 points
  // ============================================================
  let inspectionPoints = 10; // neutral default
  const inspStatus = String(inspectionData.inspectionStatus || '').toUpperCase();
  const damageReports = Number(inspectionData.damageReports || 0);
  const maintenanceCount = Number(inspectionData.maintenanceCount || 0);

  if (inspStatus === 'PASSED' || inspStatus === 'APPROVED') inspectionPoints += 3;
  else if (inspStatus === 'FAILED' || inspStatus === 'REJECTED') inspectionPoints -= 5;

  if (maintenanceCount >= 2) inspectionPoints += 2; // proactive maintenance is good
  if (damageReports === 0) inspectionPoints += 2;
  else if (damageReports >= 3) inspectionPoints -= 3;

  inspectionPoints = clamp(inspectionPoints, 0, 15);
  details.inspection = inspectionPoints;

  // ============================================================
  // 5. Completed Rental History: 10 points
  // ============================================================
  let historyPoints = 5; // neutral
  if (completed >= 50) historyPoints = 10;
  else if (completed >= 20) historyPoints = 8;
  else if (completed >= 10) historyPoints = 6;
  else if (completed >= 5) historyPoints = 5;
  else if (completed >= 1) historyPoints = 3;
  else historyPoints = 2;

  // Penalize late handovers
  const lateHandovers = Number(rentalStats.lateHandovers || 0);
  if (lateHandovers >= 3) historyPoints -= 2;
  historyPoints = clamp(historyPoints, 0, 10);
  details.history = historyPoints;

  // ============================================================
  // 6. Owner Verification: 5 points
  // ============================================================
  const isVerified = ownerData.isVerified === true
    || String(ownerData.owner_status || '').toUpperCase() === 'APPROVED';
  const verificationPoints = isVerified ? 5 : 0;
  details.verification = verificationPoints;

  // ============================================================
  // Total Score
  // ============================================================
  const totalScore = clamp(
    sentimentPoints + avgRatingPoints + cancellationPoints + inspectionPoints + historyPoints + verificationPoints,
    1,
    100
  );

  // Level
  let level;
  if (totalScore >= 85) level = 'Excellent';
  else if (totalScore >= 70) level = 'Good';
  else if (totalScore >= 50) level = 'Average';
  else if (totalScore >= 30) level = 'Below Average';
  else level = 'Poor';

  // Explanation
  const explParts = [];
  if (verificationPoints === 5) explParts.push('Verified owner.');
  if (sentimentPoints >= 28) explParts.push('High review sentiment.');
  else if (sentimentPoints < 15) explParts.push('Low review sentiment.');
  if (cancellationPoints >= 12) explParts.push('Low cancellation rate.');
  else if (cancellationPoints < 6) explParts.push('High cancellation rate.');
  if (completed >= 10) explParts.push(`${completed} completed rentals.`);
  if (inspectionPoints >= 13) explParts.push('Stable inspection history.');
  else if (inspectionPoints < 7) explParts.push('Some inspection concerns.');

  const explanation = explParts.length > 0
    ? explParts.join(' ')
    : 'Trust score calculated from available data.';

  return {
    vehicleId,
    ownerId,
    trustScore: totalScore,
    level,
    explanation,
    breakdown: details,
    calculatedAt: new Date().toISOString(),
  };
}
