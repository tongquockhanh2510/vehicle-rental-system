export const VEHICLE_PLACEHOLDER_IMAGE = "/images/car-placeholder.svg";

function pickImageFromCandidate(candidate) {
  if (!candidate) return null;

  if (typeof candidate === "string" && candidate.trim()) {
    const normalizedText = candidate.trim();

    // Support legacy payload where images were persisted as JSON string.
    if (
      normalizedText.startsWith("[") &&
      normalizedText.endsWith("]")
    ) {
      try {
        const parsed = JSON.parse(normalizedText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return pickImageFromCandidate(parsed[0]);
        }
      } catch {
        // Keep raw value fallback below.
      }
    }

    return normalizeImageUrl(normalizedText);
  }

  if (typeof candidate === "object") {
    const objectValue =
      candidate.url ||
      candidate.src ||
      candidate.image_url ||
      candidate.image ||
      candidate.location;
    if (typeof objectValue === "string" && objectValue.trim()) {
      return normalizeImageUrl(objectValue.trim());
    }
  }

  return null;
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return null;
  const value = String(imageUrl).trim();
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  ) {
    try {
      return encodeURI(value);
    } catch {
      return value;
    }
  }

  return value;
}

export function getVehicleImages(vehicle) {
  const listCandidates = Array.isArray(vehicle?.images)
    ? vehicle.images
    : vehicle?.images
      ? [vehicle.images]
      : [];

  const extraCandidates = [
    vehicle?.image_url,
    vehicle?.image,
    vehicle?.thumbnail,
    vehicle?.photo_url,
  ];

  const merged = [...listCandidates, ...extraCandidates];
  const images = merged
    .map((candidate) => pickImageFromCandidate(candidate))
    .filter(Boolean);

  return Array.from(new Set(images));
}

export function getVehicleMainImage(vehicle) {
  return getVehicleImages(vehicle)[0] || null;
}

export function getFallbackCarImage() {
  return VEHICLE_PLACEHOLDER_IMAGE;
}

export function buildVehicleFallbackImage(vehicle) {
  const brand = vehicle?.brand || "RentCar Premium";
  const model = vehicle?.model || "Phuong tien";
  const type = vehicle?.vehicle_type || "VEHICLE";
  const title = `${brand} ${model}`.trim();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="52%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <radialGradient id="glow1" cx="0.15" cy="0.18" r="0.45">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.84" cy="0.16" r="0.48">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect width="1280" height="720" fill="url(#glow1)"/>
    <rect width="1280" height="720" fill="url(#glow2)"/>
    <rect x="48" y="48" width="1184" height="624" rx="30" fill="none" stroke="#334155" stroke-opacity="0.7"/>

    <text x="92" y="130" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="30" letter-spacing="3">${escapeXml(
      type,
    )}</text>
    <text x="92" y="220" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="62" font-weight="700">${escapeXml(
      title,
    )}</text>
    <text x="92" y="280" fill="#38bdf8" font-family="Segoe UI, Arial, sans-serif" font-size="30">Hinh anh dang duoc cap nhat</text>

    <g transform="translate(740,175)">
      <rect x="0" y="0" width="420" height="270" rx="26" fill="#0b1220" stroke="#1e293b"/>
      <path d="M70 170c12-42 45-72 88-72h105c42 0 80 24 100 62l20 38v31h-26c-4 21-22 37-44 37-22 0-40-16-44-37H174c-4 21-22 37-44 37-22 0-40-16-44-37H60v-30z" fill="#0ea5e9" fill-opacity="0.25" stroke="#67e8f9" stroke-width="4"/>
      <circle cx="125" cy="234" r="27" fill="#020617" stroke="#94a3b8" stroke-width="5"/>
      <circle cx="312" cy="234" r="27" fill="#020617" stroke="#94a3b8" stroke-width="5"/>
      <rect x="170" y="120" width="128" height="42" rx="10" fill="#38bdf8" fill-opacity="0.3"/>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function resolveImage(imageUrl) {
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    return normalizeImageUrl(imageUrl.trim());
  }
  return VEHICLE_PLACEHOLDER_IMAGE;
}
