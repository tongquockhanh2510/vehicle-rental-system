import axios from 'axios';

const VEHICLE_SERVICE_URL = process.env.VEHICLE_SERVICE_URL || 'http://localhost:3002';
const REQUEST_TIMEOUT = Number.parseInt(process.env.AI_AGENT_TIMEOUT_MS || '8000', 10);
const SOFT_BUDGET_MULTIPLIER = 1.15;

const LOCATION_ALIASES = [
  {
    canonical: 'TP. Hồ Chí Minh',
    aliases: ['tp.hcm', 'tphcm', 'tp hcm', 'ho chi minh', 'hồ chí minh', 'hcm', 'sai gon', 'sài gòn', 'saigon']
  },
  {
    canonical: 'Hà Nội',
    aliases: ['ha noi', 'hà nội', 'hanoi']
  },
  {
    canonical: 'Đà Nẵng',
    aliases: ['da nang', 'đà nẵng', 'danang']
  },
  {
    canonical: 'Đà Lạt',
    aliases: ['da lat', 'đà lạt', 'dalat']
  },
  {
    canonical: 'Nha Trang',
    aliases: ['nha trang']
  },
  {
    canonical: 'Vũng Tàu',
    aliases: ['vung tau', 'vũng tàu']
  }
];

function normalizeText(input = '') {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function canonicalizeLocation(input) {
  const source = String(input || '').trim();
  if (!source) {
    return { canonical: '', tokens: [] };
  }

  const normalized = normalizeText(source);
  const matched = LOCATION_ALIASES.find((item) =>
    item.aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );

  if (matched) {
    return {
      canonical: matched.canonical,
      tokens: normalizeText(matched.canonical).split(' ')
    };
  }

  return {
    canonical: source,
    tokens: normalized.split(' ').filter(Boolean)
  };
}

function locationMatches(vehicle = {}, locationMeta = { tokens: [] }) {
  if (!locationMeta.tokens?.length) return true;

  const merged = normalizeText(
    [
      vehicle.pickup_location,
      vehicle.return_location,
      vehicle.city,
      vehicle.district,
      vehicle.allowed_region
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (!merged) return false;

  const tokens = locationMeta.tokens.filter((token) => token.length > 1);
  return tokens.every((token) => merged.includes(token));
}

function dedupeVehicles(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const id = String(row?._id || row?.id || '');
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, row);
    }
  }
  return Array.from(map.values());
}

async function fetchAvailable(params) {
  const response = await axios.get(`${VEHICLE_SERVICE_URL}/api/vehicles/available/list`, {
    params,
    timeout: REQUEST_TIMEOUT
  });
  return toRows(response.data);
}

function getSearchPlans(slots, locationMeta) {
  const plans = [];
  const limit = 80;

  const strict = {
    limit,
    sort: '-average_rating'
  };

  if (slots.vehicleType) strict.vehicle_type = slots.vehicleType;
  if (slots.fuelType) strict.fuel_type = slots.fuelType;
  if (slots.maxPrice) strict.max_price = Math.round(slots.maxPrice * SOFT_BUDGET_MULTIPLIER);
  if (locationMeta.canonical) {
    strict.location = locationMeta.canonical;
    strict.city = locationMeta.canonical;
  }

  plans.push(strict);

  if (slots.vehicleType || slots.fuelType) {
    plans.push({
      limit,
      sort: '-average_rating',
      ...(slots.vehicleType ? { vehicle_type: slots.vehicleType } : {}),
      ...(slots.fuelType ? { fuel_type: slots.fuelType } : {})
    });
  }

  if (locationMeta.canonical) {
    plans.push({
      limit,
      sort: '-average_rating',
      location: locationMeta.canonical,
      city: locationMeta.canonical
    });
  }

  plans.push({
    limit,
    sort: '-average_rating'
  });

  const seen = new Set();
  return plans.filter((plan) => {
    const key = JSON.stringify(plan);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchVehicles(slots) {
  const locationMeta = canonicalizeLocation(slots.location);
  const plans = getSearchPlans(slots, locationMeta);
  const all = [];

  for (const plan of plans) {
    try {
      const rows = await fetchAvailable(plan);
      all.push(...rows);
      if (all.length >= 120) break;
    } catch (error) {
      console.warn('[ai-agent] search plan failed:', error.message);
    }
  }

  const unique = dedupeVehicles(all).filter((vehicle) => vehicle?.is_available !== false);

  return unique.filter((vehicle) => {
    if (slots.vehicleType && String(vehicle.vehicle_type || '').toUpperCase() !== slots.vehicleType) {
      return false;
    }
    if (slots.fuelType && String(vehicle.fuel_type || '').toUpperCase() !== slots.fuelType) {
      return false;
    }
    if (slots.maxPrice) {
      const price = Number(vehicle.daily_rate || 0);
      if (!price || price > Math.round(slots.maxPrice * SOFT_BUDGET_MULTIPLIER)) return false;
    }
    if (!locationMatches(vehicle, locationMeta)) {
      return false;
    }
    return true;
  });
}

export function rankVehicles(vehicles, slots) {
  const locationMeta = canonicalizeLocation(slots.location);
  const budget = Number(slots.maxPrice || 0);

  const scored = vehicles.map((vehicle) => {
    const rating = Number(vehicle.average_rating || 0);
    const completedTrips = Number(vehicle.total_rentals || 0);
    const trustScore = Number(vehicle.trust_score || 60);
    const price = Number(vehicle.daily_rate || 0);
    const typeMatch =
      !slots.vehicleType || String(vehicle.vehicle_type || '').toUpperCase() === slots.vehicleType;
    const fuelMatch =
      !slots.fuelType || String(vehicle.fuel_type || '').toUpperCase() === slots.fuelType;
    const locMatch = locationMatches(vehicle, locationMeta);

    let score = rating * 12;
    score += Math.min(completedTrips, 40) * 0.8;
    score += Math.min(trustScore, 100) * 0.2;
    if (typeMatch) score += 22;
    if (fuelMatch) score += 10;
    if (locMatch) score += 20;
    if (vehicle.is_available) score += 8;

    if (budget > 0 && price > 0) {
      if (price <= budget) {
        score += 16;
      } else if (price <= budget * SOFT_BUDGET_MULTIPLIER) {
        score += 6;
      } else {
        score -= 20;
      }
    }

    return { vehicle, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ vehicle, score }) => ({
      id: vehicle._id || vehicle.id,
      name: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Phương tiện',
      vehicleType: vehicle.vehicle_type || 'CAR',
      pricePerDay: Number(vehicle.daily_rate || 0),
      rating: Number(vehicle.average_rating || 0),
      trustScore: Number(vehicle.trust_score || 0),
      imageUrl: Array.isArray(vehicle.images) ? vehicle.images[0] || '' : '',
      location: vehicle.pickup_location || vehicle.city || vehicle.allowed_region || '',
      depositAmount: Number(vehicle.deposit_amount || 0),
      seats: Number(vehicle.seats || 0),
      transmission: vehicle.transmission || '',
      fuelType: vehicle.fuel_type || '',
      bookingUrl: `/vehicles/${vehicle._id || vehicle.id}`,
      score: Number(score.toFixed(2))
    }));
}

export function generateAlternatives(slots) {
  const alternatives = [];

  if (slots.maxPrice) {
    const raise = Math.round((slots.maxPrice * 1.25) / 100000) * 100000;
    alternatives.push({
      type: 'HIGHER_BUDGET',
      message: `Tăng ngân sách lên khoảng ${raise.toLocaleString('vi-VN')} VND/ngày để mở rộng lựa chọn.`
    });
  }

  if (slots.vehicleType === 'SEVEN_SEATER') {
    alternatives.push({
      type: 'DIFFERENT_TYPE',
      message: 'Nếu linh hoạt, bạn có thể thử ô tô 5 chỗ để có nhiều xe sẵn hơn.'
    });
  }

  if (slots.fuelType === 'ELECTRIC') {
    alternatives.push({
      type: 'DIFFERENT_FUEL',
      message: 'Bạn có thể thử thêm xe hybrid hoặc xăng để có nhiều lựa chọn gần khu vực hơn.'
    });
  }

  if (slots.location) {
    alternatives.push({
      type: 'NEARBY_LOCATION',
      message: 'Thử mở rộng khu vực tìm kiếm sang quận lân cận để tăng tỉ lệ có xe phù hợp.'
    });
  }

  if (!slots.startDate || !slots.endDate) {
    alternatives.push({
      type: 'DATE_RANGE',
      message: 'Bổ sung ngày nhận và trả xe để AI lọc chính xác hơn theo nhu cầu chuyến đi của bạn.'
    });
  }

  return alternatives;
}

