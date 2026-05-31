import axios from 'axios';

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
export async function summarizeReviews(vehicleId, reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      vehicleId,
      summary: {
        pros: [],
        cons: [],
        commonComplaints: [],
        ownerBehavior: 'Chưa có đánh giá nào.',
        vehicleCondition: 'Chưa có đánh giá nào.',
        recommendation: 'Phương tiện này chưa có đánh giá nào. Hãy cân nhắc kỹ trước khi thuê.',
      },
      averageRating: null,
      reviewCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalRating / reviews.length;

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey) {
    try {
      const serializedReviews = reviews.map((r, i) => `Review #${i+1} (${r.rating} stars): "${r.comment || ''}"`).join('\n');
      const prompt = `You are an AI reviews analyzer for a peer-to-peer (P2P) vehicle rental system. Your task is to analyze the following user reviews for vehicle ID "${vehicleId}" and generate a structured JSON summary.

Reviews:
${serializedReviews}

Please return ONLY a JSON object with the following schema:
{
  "summary": {
    "pros": ["bullet points of pros in Vietnamese, e.g. 'Chủ xe thân thiện', 'Xe sạch sẽ'"],
    "cons": ["bullet points of cons in Vietnamese, e.g. 'Máy lạnh yếu'"],
    "commonComplaints": ["recurring issues mentioned by multiple users in Vietnamese"],
    "ownerBehavior": "brief summary of how the owner treats renters and punctuality in Vietnamese",
    "vehicleCondition": "brief summary of the car/motorcycle condition in Vietnamese",
    "recommendation": "overall recommendation to potential renters in Vietnamese"
  }
}

Strict follow these rules:
1. Do not wrap the output in markdown block (do NOT use \`\`\`json). Just output raw JSON.
2. If there are no negative points, "cons" and "commonComplaints" should be empty arrays.
3. Write everything in the "summary" object in natural, friendly Vietnamese since the target users are Vietnamese renters.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        },
        { timeout: 7000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const result = JSON.parse(responseText.trim());
        return {
          vehicleId,
          summary: result.summary,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length,
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (geminiError) {
      console.warn('[ai-service] Gemini API reviews summarizer failed, falling back to rule-based parser:', geminiError.message);
    }
  }

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

  if (proAspectCount.owner >= 2) pros.push('Chủ xe thân thiện và chuyên nghiệp.');
  if (proAspectCount.condition >= 2) pros.push('Phương tiện ở trong tình trạng tốt.');
  if (proAspectCount.cleanliness >= 2) pros.push('Phương tiện sạch sẽ.');
  if (proAspectCount.punctuality >= 2) pros.push('Chủ xe bàn giao xe đúng giờ.');
  if (proAspectCount.ac >= 1) pros.push('Hệ thống máy lạnh hoạt động tốt.');

  if (averageRating >= 4.5) pros.push('Được hầu hết người thuê đánh giá rất cao.');
  else if (averageRating >= 4.0) pros.push('Điểm đánh giá tốt và ổn định.');

  if (pros.length === 0 && posReviews.length > 0) {
    pros.push('Nhận được nhiều phản hồi tích cực từ khách thuê.');
  }

  // Build cons
  const cons = [];
  const conAspectCount = {};

  for (const r of negReviews) {
    for (const aspect of r.aspects) {
      conAspectCount[aspect] = (conAspectCount[aspect] || 0) + 1;
    }
  }

  if (conAspectCount.ac >= 2) cons.push('Hệ thống điều hòa/máy lạnh có thể hoạt động chưa hiệu quả.');
  if (conAspectCount.cleanliness >= 2) cons.push('Một số người thuê lưu ý về vệ sinh xe chưa tốt.');
  if (conAspectCount.punctuality >= 2) cons.push('Chủ xe đôi khi bàn giao xe trễ hẹn.');
  if (conAspectCount.condition >= 2) cons.push('Tình trạng xe có thể cần được bảo dưỡng thêm.');

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
      commonComplaints.push(`Nhắc đến nhiều lần: "${kw}"`);
    }
  }

  // Owner behavior summary
  let ownerBehavior = 'Thái độ của chủ xe được đánh giá tốt.';
  if (proAspectCount.owner >= 3) ownerBehavior = 'Chủ xe rất nhiệt tình, thân thiện và chuyên nghiệp.';
  else if (conAspectCount.punctuality >= 2) ownerBehavior = 'Chủ xe đôi khi bị trễ giờ. Bạn hãy chủ động liên hệ trước.';

  // Vehicle condition summary
  let vehicleCondition = 'Phương tiện ở trong tình trạng chấp nhận được.';
  if (proAspectCount.condition >= 3) vehicleCondition = 'Phương tiện ở trong tình trạng tuyệt vời, được bảo dưỡng tốt.';
  else if (conAspectCount.condition >= 2) vehicleCondition = 'Một số người thuê ghi nhận xe có lỗi nhỏ.';

  // Recommendation
  let recommendation;
  if (averageRating >= 4.5 && negReviews.length === 0) {
    recommendation = 'Rất khuyên dùng. Đánh giá xuất sắc và không có phàn nàn nào đáng kể.';
  } else if (averageRating >= 4.0) {
    recommendation = 'Lựa chọn tốt. Có một số phản hồi nhỏ nhưng trải nghiệm chung rất tốt.';
  } else if (averageRating >= 3.0) {
    recommendation = 'Lựa chọn trung bình. Hãy kiểm tra kỹ các nhược điểm trước khi đặt.';
  } else {
    recommendation = 'Nên cân nhắc lựa chọn khác. Có nhiều đánh giá tiêu cực.';
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
