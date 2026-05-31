/**
 * reviewSummarizer.js
 * Rule-based review summarizer.
 * Analyzes review texts and ratings to produce structured summaries.
 */

// Keywords that indicate positive sentiment
const POSITIVE_KEYWORDS = [
  // Vietnamese
  'tốt', 'tuyệt', 'xuất sắc', 'hài lòng', 'sạch', 'đúng giờ', 'thân thiện',
  'chuyên nghiệp', 'nhanh', 'tiết kiệm', 'rộng', 'thoải mái', 'mới', 'đẹp',
  'đáng tin', 'uy tín', 'nhiệt tình', 'chu đáo', 'giao xe đúng giờ',
  // English
  'good', 'great', 'excellent', 'clean', 'on time', 'friendly', 'professional',
  'fast', 'spacious', 'comfortable', 'new', 'beautiful', 'reliable', 'punctual',
  'helpful', 'smooth', 'fuel efficient', 'worth',
];

// Keywords that indicate negative sentiment
const NEGATIVE_KEYWORDS = [
  // Vietnamese
  'tệ', 'kém', 'bẩn', 'trễ', 'muộn', 'hỏng', 'cũ', 'ồn', 'nóng', 'không đúng giờ',
  'thất vọng', 'chậm', 'khó', 'xấu', 'yếu', 'điều hoà', 'máy lạnh không mát',
  'mùi', 'nứt', 'xước',
  // English
  'bad', 'poor', 'dirty', 'late', 'broken', 'old', 'noisy', 'hot', 'disappointing',
  'slow', 'rough', 'smell', 'crack', 'scratch', 'weak air', 'unreliable',
];

// Aspect keywords mapped to category
const ASPECT_MAP = {
  owner: ['chủ xe', 'chủ', 'owner', 'người cho thuê', 'host'],
  condition: ['xe', 'tình trạng', 'condition', 'vehicle', 'car', 'motor'],
  ac: ['điều hoà', 'máy lạnh', 'air', 'ac', 'conditioning', 'mát'],
  cleanliness: ['sạch', 'bẩn', 'clean', 'dirty', 'smell', 'mùi'],
  punctuality: ['đúng giờ', 'trễ', 'muộn', 'on time', 'late', 'punctual'],
};

/**
 * Simple sentiment scorer for a text string.
 * Returns a value between -1 (very negative) and +1 (very positive).
 */
function scoreSentiment(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();

  let pos = 0;
  let neg = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) pos++;
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) neg++;
  }

  const total = pos + neg;
  if (total === 0) return 0;
  return (pos - neg) / total;
}

/**
 * Extract aspect mentions from a review text.
 * @param {string} text
 * @returns {string[]} list of aspect keys mentioned
 */
function extractAspects(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const [aspect, keywords] of Object.entries(ASPECT_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(aspect);
    }
  }
  return found;
}

/**
 * Main review summarizer.
 *
 * @param {string} vehicleId
 * @param {Array<{rating: number, comment: string, created_at: string}>} reviews
 * @returns {object} structured summary
 */
export function summarizeReviews(vehicleId, reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      vehicleId,
      summary: {
        pros: [],
        cons: [],
        commonComplaints: [],
        ownerBehavior: 'No reviews yet.',
        vehicleCondition: 'No reviews yet.',
        recommendation: 'This vehicle has no reviews yet. Proceed with caution.',
      },
      averageRating: null,
      reviewCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalRating / reviews.length;

  // Sentiment analysis
  const sentimentScores = reviews.map((r) => ({
    score: scoreSentiment(r.comment),
    rating: r.rating || 0,
    aspects: extractAspects(r.comment),
    comment: r.comment || '',
  }));

  const posReviews = sentimentScores.filter((r) => r.score > 0.1 || r.rating >= 4);
  const negReviews = sentimentScores.filter((r) => r.score < -0.1 || r.rating <= 2);

  // Build pros
  const pros = [];
  const proAspectCount = {};

  for (const r of posReviews) {
    for (const aspect of r.aspects) {
      proAspectCount[aspect] = (proAspectCount[aspect] || 0) + 1;
    }
  }

  if (proAspectCount.owner >= 2) pros.push('Owner is friendly and professional.');
  if (proAspectCount.condition >= 2) pros.push('Vehicle is in good condition.');
  if (proAspectCount.cleanliness >= 2) pros.push('Vehicle is clean.');
  if (proAspectCount.punctuality >= 2) pros.push('Owner delivers the vehicle on time.');
  if (proAspectCount.ac >= 1) pros.push('Air conditioning works well.');

  if (averageRating >= 4.5) pros.push('Highly rated by most renters.');
  else if (averageRating >= 4.0) pros.push('Consistently good ratings.');

  if (pros.length === 0 && posReviews.length > 0) {
    pros.push('Generally positive feedback from renters.');
  }

  // Build cons
  const cons = [];
  const conAspectCount = {};

  for (const r of negReviews) {
    for (const aspect of r.aspects) {
      conAspectCount[aspect] = (conAspectCount[aspect] || 0) + 1;
    }
  }

  if (conAspectCount.ac >= 2) cons.push('Air conditioning may not cool the cabin effectively.');
  if (conAspectCount.cleanliness >= 2) cons.push('Some renters noted cleanliness issues.');
  if (conAspectCount.punctuality >= 2) cons.push('Owner has had some delays in delivery.');
  if (conAspectCount.condition >= 2) cons.push('Vehicle condition may need attention.');

  // Common complaints
  const commonComplaints = [];
  const allKeywordHits = {};

  for (const r of sentimentScores) {
    for (const kw of NEGATIVE_KEYWORDS) {
      if (r.comment.toLowerCase().includes(kw)) {
        allKeywordHits[kw] = (allKeywordHits[kw] || 0) + 1;
      }
    }
  }

  const sortedComplaints = Object.entries(allKeywordHits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  for (const [kw] of sortedComplaints) {
    if (allKeywordHits[kw] >= 2) {
      commonComplaints.push(`Recurring mention: "${kw}"`);
    }
  }

  // Owner behavior summary
  let ownerBehavior = 'Owner behavior is satisfactory based on reviews.';
  if (proAspectCount.owner >= 3) ownerBehavior = 'Owner is very responsive, friendly and professional.';
  else if (conAspectCount.punctuality >= 2) ownerBehavior = 'Owner has had some delays. Plan accordingly.';

  // Vehicle condition summary
  let vehicleCondition = 'Vehicle is in acceptable condition.';
  if (proAspectCount.condition >= 3) vehicleCondition = 'Vehicle is in excellent condition, well-maintained.';
  else if (conAspectCount.condition >= 2) vehicleCondition = 'Some renters reported condition issues.';

  // Recommendation
  let recommendation;
  if (averageRating >= 4.5 && negReviews.length === 0) {
    recommendation = 'Highly recommended. Excellent reviews and no significant complaints.';
  } else if (averageRating >= 4.0) {
    recommendation = 'Good choice overall. Minor issues reported but generally positive experience.';
  } else if (averageRating >= 3.0) {
    recommendation = 'Average option. Check specific cons before booking.';
  } else {
    recommendation = 'Consider alternatives. Several negative reviews reported.';
  }

  return {
    vehicleId,
    summary: {
      pros,
      cons,
      commonComplaints,
      ownerBehavior,
      vehicleCondition,
      recommendation,
    },
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length,
    updatedAt: new Date().toISOString(),
  };
}
