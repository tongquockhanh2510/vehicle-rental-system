import axios from 'axios';

const VEHICLE_TYPE_PATTERNS = [
  { value: 'SEVEN_SEATER', patterns: ['7 cho', '7 seat', '7-seat', 'seven seater', 'xe 7', 'bay cho', 'innova', 'carnival'] },
  { value: 'PICKUP_TRUCK', patterns: ['ban tai', 'pickup', 'pick up', 'ford ranger', 'hilux', 'triton'] },
  { value: 'MOTORCYCLE', patterns: ['xe may', 'motorbike', 'motorcycle', 'scooter', 'moto'] },
  { value: 'BICYCLE', patterns: ['xe dap', 'bicycle', 'bike'] },
  { value: 'CAR', patterns: ['o to', 'xe hoi', '4 cho', '5 cho', 'sedan', 'hatchback', 'suv'] }
];

const ELECTRIC_PATTERNS = ['xe dien', 'electric', 'ev', 'vinfast vf', 'tesla'];

const LOCATION_ALIASES = [
  { canonical: 'TP. Hồ Chí Minh', aliases: ['tp hcm', 'tphcm', 'tp.hcm', 'hcm', 'ho chi minh', 'hồ chí minh', 'sai gon', 'sài gòn', 'saigon'] },
  { canonical: 'Hà Nội', aliases: ['ha noi', 'hà nội', 'hanoi'] },
  { canonical: 'Đà Nẵng', aliases: ['da nang', 'đà nẵng', 'danang'] },
  { canonical: 'Đà Lạt', aliases: ['da lat', 'đà lạt', 'dalat'] },
  { canonical: 'Nha Trang', aliases: ['nha trang'] },
  { canonical: 'Vũng Tàu', aliases: ['vung tau', 'vũng tàu'] },
  { canonical: 'Hội An', aliases: ['hoi an', 'hội an'] },
  { canonical: 'Phú Quốc', aliases: ['phu quoc', 'phú quốc'] }
];

const PRICE_PATTERNS = [
  /(\d+(?:[.,]\d+)?)\s*trieu\s*ruoi/i,
  /(\d+(?:[.,]\d+)?)\s*trieu/i,
  /(\d+(?:[.,]\d+)?)\s*million/i,
  /(\d+)\s*k\b/i,
  /\b(\d{6,})\b/
];

const WEEKDAY_MAP = {
  'chu nhat': 0,
  sunday: 0,
  'thu hai': 1,
  monday: 1,
  'thu ba': 2,
  tuesday: 2,
  'thu tu': 3,
  wednesday: 3,
  'thu nam': 4,
  thursday: 4,
  'thu sau': 5,
  friday: 5,
  'thu bay': 6,
  saturday: 6
};

function normalizeText(input = '') {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseJsonLoose(raw = '') {
  const text = String(raw || '').trim();
  if (!text) return null;
  const clean = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextWeekday(targetWeekday, nextWeek = false) {
  const now = new Date();
  const today = now.getDay();
  let diff = targetWeekday - today;
  if (diff <= 0) diff += 7;
  if (nextWeek) diff += 7;
  const result = new Date(now);
  result.setDate(now.getDate() + diff);
  return result;
}

function parseDateSegment(segment = '') {
  const normalized = normalizeText(segment);
  if (!normalized) return null;

  if (normalized.includes('hom nay') || normalized.includes('today')) {
    return new Date();
  }
  if (normalized.includes('ngay mai') || normalized.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const iso = normalized.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);

  const dmy = normalized.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?\b/);
  if (dmy) {
    const year = dmy[3] ? Number(dmy[3]) : new Date().getFullYear();
    const month = String(Number(dmy[2])).padStart(2, '0');
    const day = String(Number(dmy[1])).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const isNextWeek = normalized.includes('tuan sau') || normalized.includes('next week');
  for (const [name, weekday] of Object.entries(WEEKDAY_MAP)) {
    if (normalized.includes(name)) {
      return getNextWeekday(weekday, isNextWeek);
    }
  }

  return null;
}

function extractDateRange(message) {
  const raw = String(message || '');
  const normalized = normalizeText(raw);
  const fromTo = normalized.match(/(?:tu|from)\s+(.+?)\s+(?:den|to)\s+(.+?)(?:,|$)/i);
  if (fromTo) {
    return {
      startDate: formatDate(parseDateSegment(fromTo[1])),
      endDate: formatDate(parseDateSegment(fromTo[2]))
    };
  }

  const single = parseDateSegment(normalized);
  return {
    startDate: formatDate(single),
    endDate: null
  };
}

function extractLocation(message = '') {
  const normalized = normalizeText(message);
  const found = LOCATION_ALIASES.find((item) =>
    item.aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );
  if (found) return found.canonical;

  const direct = normalized.match(/(?:o|tai|in|at)\s+([a-z0-9.\s]+?)(?:\s+(?:tu|from|den|to|gia|budget)|$)/i);
  if (direct?.[1]) {
    return direct[1]
      .trim()
      .split(' ')
      .map((token) => (token ? token[0].toUpperCase() + token.slice(1) : token))
      .join(' ');
  }

  return null;
}

function extractVehicle(message = '') {
  const normalized = normalizeText(message);
  const hasElectric = ELECTRIC_PATTERNS.some((item) => normalized.includes(normalizeText(item)));

  for (const item of VEHICLE_TYPE_PATTERNS) {
    if (item.patterns.some((pattern) => normalized.includes(pattern))) {
      return {
        vehicleType: item.value,
        fuelType: hasElectric ? 'ELECTRIC' : null
      };
    }
  }

  if (hasElectric) {
    return {
      vehicleType: null,
      fuelType: 'ELECTRIC'
    };
  }

  return {
    vehicleType: null,
    fuelType: null
  };
}

function extractMaxPrice(message = '') {
  const normalized = normalizeText(message);
  for (const pattern of PRICE_PATTERNS) {
    const match = normalized.match(pattern);
    if (!match) continue;

    const value = Number(String(match[1]).replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) continue;

    if (pattern.source.includes('trieu\\s*ruoi')) {
      return Math.round(value * 1500000);
    }
    if (pattern.source.includes('trieu') || pattern.source.includes('million')) {
      return Math.round(value * 1000000);
    }
    if (pattern.source.includes('\\s*k')) {
      return Math.round(value * 1000);
    }
    return Math.round(value);
  }
  return null;
}

function extractPassengerPurpose(message = '') {
  const normalized = normalizeText(message);
  if (normalized.includes('gia dinh') || normalized.includes('family')) return 'family trip';
  if (normalized.includes('du lich') || normalized.includes('travel') || normalized.includes('tour')) return 'tourism';
  if (normalized.includes('cong tac') || normalized.includes('business') || normalized.includes('work')) return 'business';
  if (normalized.includes('dam cuoi') || normalized.includes('wedding')) return 'wedding';
  if (normalized.includes('nhom ban') || normalized.includes('friends') || normalized.includes('group')) return 'group trip';
  return null;
}

function extractIntentType(message = '') {
  const normalized = normalizeText(message);
  if (!normalized) return 'UNKNOWN';
  if (/(huy|cancel)/i.test(normalized)) return 'CANCEL_BOOKING';
  if (/(dat xe|book|booking)/i.test(normalized)) return 'BOOK_VEHICLE';
  if (/(thue|rental|tim|kiem|find|search|can xe)/i.test(normalized)) return 'SEARCH_VEHICLE';
  if (/(gia|bao nhieu|price|cost)/i.test(normalized)) return 'QUERY_PRICE';
  return 'SEARCH_VEHICLE';
}

async function extractByGemini(message, fallback) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiApiKey) return null;

  const prompt = `Extract vehicle rental intent from this user message and return JSON only.
Message: "${message}"
Schema:
{
  "intent":"SEARCH_VEHICLE|BOOK_VEHICLE|CANCEL_BOOKING|QUERY_PRICE|UNKNOWN",
  "vehicleType":"SEVEN_SEATER|PICKUP_TRUCK|MOTORCYCLE|BICYCLE|CAR|null",
  "fuelType":"ELECTRIC|PETROL|DIESEL|HYBRID|null",
  "location":"string|null",
  "startDate":"YYYY-MM-DD|null",
  "endDate":"YYYY-MM-DD|null",
  "maxPrice":number|null,
  "passengerPurpose":"family trip|tourism|business|wedding|group trip|null"
}
Keep values realistic and return strict JSON without markdown.
Fallback context:
${JSON.stringify(fallback)}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      },
      { timeout: 4000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('') || '';
    return parseJsonLoose(text);
  } catch (error) {
    console.warn('[ai-agent] Gemini intent fallback:', error.message);
    return null;
  }
}

export async function extractIntent(message) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { intent: 'UNKNOWN', error: 'Empty or invalid message' };
  }

  const vehicle = extractVehicle(message);
  const range = extractDateRange(message);
  const base = {
    intent: extractIntentType(message),
    vehicleType: vehicle.vehicleType,
    fuelType: vehicle.fuelType,
    location: extractLocation(message),
    startDate: range.startDate,
    endDate: range.endDate,
    maxPrice: extractMaxPrice(message),
    passengerPurpose: extractPassengerPurpose(message),
    rawMessage: message.trim()
  };

  const ai = await extractByGemini(message, base);
  if (!ai || typeof ai !== 'object') {
    return base;
  }

  return {
    intent: ai.intent || base.intent,
    vehicleType: ai.vehicleType || base.vehicleType,
    fuelType: ai.fuelType || base.fuelType,
    location: ai.location || base.location,
    startDate: ai.startDate || base.startDate,
    endDate: ai.endDate || base.endDate,
    maxPrice: Number.isFinite(Number(ai.maxPrice)) ? Number(ai.maxPrice) : base.maxPrice,
    passengerPurpose: ai.passengerPurpose || base.passengerPurpose,
    rawMessage: base.rawMessage
  };
}
