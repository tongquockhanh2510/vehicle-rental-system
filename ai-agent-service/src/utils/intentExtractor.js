/**
 * intentExtractor.js
 * Rule-based NLP intent extractor for Vietnamese and English.
 * Extracts: intent, vehicleType, location, startDate, endDate, maxPrice, passengerPurpose.
 *
 * Designed to be replaceable by an LLM call (OpenAI, Gemini, etc.) later.
 */

// ─── Vehicle type mappings ──────────────────────────────────────────────────
const VEHICLE_TYPE_PATTERNS = {
  SEVEN_SEATER: [
    '7 chỗ', '7 seat', '7-seat', 'seven seat', 'xe 7', 'bảy chỗ',
    '7 chỗ ngồi', 'innova', 'fortuner', '7-seater',
  ],
  PICKUP_TRUCK: [
    'bán tải', 'pickup', 'pick-up', 'truck',
  ],
  MOTORCYCLE: [
    'xe máy', 'motor', 'motorbike', 'motorcycle', 'xe mô tô', 'scooter',
  ],
  BICYCLE: [
    'xe đạp', 'bicycle', 'bike',
  ],
  CAR: [
    '4 chỗ', '4-seat', '4 seat', 'four seat', 'sedan', 'hatchback',
    'ô tô', 'xe hơi', 'car', 'automobile',
  ],
};

// ─── Location extraction ────────────────────────────────────────────────────
const KNOWN_LOCATIONS = [
  'hà nội', 'ha noi', 'hanoi',
  'hồ chí minh', 'ho chi minh', 'hcm', 'sài gòn', 'saigon',
  'đà nẵng', 'da nang', 'danang',
  'đà lạt', 'da lat', 'dalat',
  'nha trang',
  'phú quốc', 'phu quoc',
  'hội an', 'hoi an',
  'sapa', 'sa pa',
  'hạ long', 'ha long', 'halong',
  'mũi né', 'mui ne',
  'buôn ma thuột', 'buon ma thuot', 'bmt',
  'ea súp', 'ea sup',
  'huế', 'hue',
  'quy nhơn', 'quy nhon',
  'vũng tàu', 'vung tau',
  'phan thiết', 'phan thiet',
];

// ─── Price patterns ─────────────────────────────────────────────────────────
// Matches: "1.5 triệu", "1 triệu rưỡi", "under 2 million", "tầm 800k", "1500000"
const PRICE_PATTERNS = [
  // Vietnamese: "1 triệu rưỡi" = 1.5 million
  { pattern: /(\d+)\s*triệu\s*rưỡi/i, multiplier: 1000000, modifier: 1.5 },
  // "X triệu Y trăm"
  { pattern: /(\d+)\s*triệu\s*(\d+)\s*trăm/i, multiplier: 1000000, hasHundred: true },
  // "X.Y triệu"
  { pattern: /(\d+[.,]\d+)\s*triệu/i, multiplier: 1000000 },
  // "X triệu"
  { pattern: /(\d+)\s*triệu/i, multiplier: 1000000 },
  // "X00k" or "Xk" (thousand)
  { pattern: /(\d+)\s*k\b/i, multiplier: 1000 },
  // "X million"
  { pattern: /(\d+[.,]\d+)\s*million/i, multiplier: 1000000 },
  { pattern: /(\d+)\s*million/i, multiplier: 1000000 },
  // Raw number >= 100000
  { pattern: /\b(\d{6,})\b/, multiplier: 1 },
];

// ─── Date/time normalization ─────────────────────────────────────────────────

const WEEKDAY_VI = {
  'thứ hai': 1, 'thứ 2': 1, 't2': 1,
  'thứ ba': 2, 'thứ 3': 2, 't3': 2,
  'thứ tư': 3, 'thứ 4': 3, 't4': 3,
  'thứ năm': 4, 'thứ 5': 4, 't5': 4,
  'thứ sáu': 5, 'thứ 6': 5, 't6': 5, 'friday': 5,
  'thứ bảy': 6, 'thứ 7': 6, 't7': 6, 'saturday': 6,
  'chủ nhật': 0, 'cn': 0, 'sunday': 0,
  'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
};

const TIME_OF_DAY = {
  'sáng': '08:00:00',
  'morning': '08:00:00',
  'trưa': '12:00:00',
  'noon': '12:00:00',
  'chiều': '17:00:00',
  'afternoon': '17:00:00',
  'tối': '20:00:00',
  'evening': '20:00:00',
  'night': '20:00:00',
};

/**
 * Get next occurrence of a weekday (0=Sun, 6=Sat) from today.
 * @param {number} targetDay - 0..6
 * @param {string} [thisWeek] - 'this' or 'next'
 */
function getNextWeekday(targetDay, thisWeek = 'this') {
  const now = new Date();
  const todayDay = now.getDay();
  let diff = targetDay - todayDay;

  if (thisWeek === 'this') {
    if (diff <= 0) diff += 7; // Go to next week if already passed
  } else {
    if (diff <= 0) diff += 7;
    diff += 7;
  }

  const result = new Date(now);
  result.setDate(now.getDate() + diff);
  return result;
}

/**
 * Extract a date from Vietnamese/English text.
 * Returns a Date or null.
 */
function extractDateFromText(text) {
  const lower = text.toLowerCase();

  // "hôm nay" / "today"
  if (/hôm nay|today/.test(lower)) return new Date();

  // "ngày mai" / "tomorrow"
  if (/ngày mai|tomorrow/.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }

  // Check for weekday names
  for (const [name, dayNum] of Object.entries(WEEKDAY_VI)) {
    if (lower.includes(name)) {
      const isNext = /tuần sau|next week/.test(lower);
      return getNextWeekday(dayNum, isNext ? 'next' : 'this');
    }
  }

  // ISO or DD/MM/YYYY date
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return new Date(isoMatch[1]);

  const dmyMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    return new Date(`${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`);
  }

  return null;
}

/**
 * Extract time of day from text (e.g., "sáng thứ 6" → 08:00:00).
 */
function extractTimeFromText(text) {
  const lower = text.toLowerCase();
  for (const [word, time] of Object.entries(TIME_OF_DAY)) {
    if (lower.includes(word)) return time;
  }
  return '08:00:00'; // default morning
}

/**
 * Extract max price from text.
 */
function extractMaxPrice(text) {
  for (const { pattern, multiplier, modifier, hasHundred } of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (modifier) {
        return Math.round(Number(match[1]) * modifier * multiplier);
      }
      if (hasHundred) {
        const million = Number(match[1]);
        const hundred = Number(match[2]);
        return Math.round((million + hundred * 0.1) * multiplier);
      }
      const num = Number(match[1].replace(',', '.'));
      return Math.round(num * multiplier);
    }
  }
  return null;
}

/**
 * Extract vehicle type from text.
 */
function extractVehicleType(text) {
  const lower = text.toLowerCase();
  for (const [type, patterns] of Object.entries(VEHICLE_TYPE_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) {
      return type;
    }
  }
  return null;
}

/**
 * Extract location from text.
 */
function extractLocation(text) {
  const lower = text.toLowerCase();
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc)) {
      // Return proper-cased location name
      return loc.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // Try to extract after "ở", "tại", "in", "at"
  const locationPrepositions = /(?:ở|tại|in|at|đến|to)\s+([A-ZÀ-Ỵa-zà-ỵ\s,]+?)(?:\s+từ|\s+ngày|\s+lúc|,|$)/i;
  const match = text.match(locationPrepositions);
  if (match) return match[1].trim();

  return null;
}

/**
 * Detect passenger purpose.
 */
function extractPassengerPurpose(text) {
  const lower = text.toLowerCase();
  if (/gia đình|family/.test(lower)) return 'family trip';
  if (/du lịch|travel|tourism/.test(lower)) return 'tourism';
  if (/công tác|business|work/.test(lower)) return 'business';
  if (/đám cưới|wedding/.test(lower)) return 'wedding';
  if (/nhóm bạn|group|friends/.test(lower)) return 'group trip';
  return null;
}

/**
 * Main intent extractor.
 * Supports Vietnamese and English.
 *
 * @param {string} message
 * @returns {object} slots
 */
export function extractIntent(message) {
  if (!message || typeof message !== 'string') {
    return { intent: 'UNKNOWN', error: 'Empty or invalid message' };
  }

  const text = message.trim();
  const lower = text.toLowerCase();

  // ─── Detect intent ─────────────────────────────────────────────────────────
  let intent = 'SEARCH_VEHICLE';

  if (/đặt xe|book|booking|thuê xe/.test(lower)) {
    intent = 'BOOK_VEHICLE';
  } else if (/hủy|cancel/.test(lower)) {
    intent = 'CANCEL_BOOKING';
  } else if (/giá|price|cost|bao nhiêu/.test(lower)) {
    intent = 'QUERY_PRICE';
  } else if (/tìm|find|search|kiếm|cần xe/.test(lower)) {
    intent = 'SEARCH_VEHICLE';
  }

  // ─── Extract slots ──────────────────────────────────────────────────────────
  const vehicleType = extractVehicleType(text);
  const location = extractLocation(text);
  const maxPrice = extractMaxPrice(text);
  const passengerPurpose = extractPassengerPurpose(text);

  // ─── Date extraction ────────────────────────────────────────────────────────
  // Try to split text into "from ... to ..." segments
  let startDate = null;
  let endDate = null;

  const fromToMatch = text.match(
    /(?:từ|from)\s+(.+?)\s+(?:đến|to)\s+(.+?)(?:\s*,|\s*giá|\s*budget|\s*tầm|$)/i
  );

  if (fromToMatch) {
    const startText = fromToMatch[1];
    const endText = fromToMatch[2];
    const startTime = extractTimeFromText(startText);
    const endTime = extractTimeFromText(endText);
    const startD = extractDateFromText(startText);
    const endD = extractDateFromText(endText);

    if (startD) {
      startDate = `${startD.toISOString().split('T')[0]}T${startTime}`;
    }
    if (endD) {
      endDate = `${endD.toISOString().split('T')[0]}T${endTime}`;
    }
  } else {
    // Try individual extraction
    const startD = extractDateFromText(text);
    if (startD) {
      startDate = `${startD.toISOString().split('T')[0]}T08:00:00`;
    }
  }

  return {
    intent,
    vehicleType,
    location,
    startDate,
    endDate,
    maxPrice,
    passengerPurpose,
    rawMessage: text,
  };
}
