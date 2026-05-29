import { normalizeVehicleTypeValue } from "../constants/vehicle";

export const CAR_PLACEHOLDERS = [
  "/images/car-placeholder.svg",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
];

const TYPE_PLACEHOLDERS = {
  MOTORCYCLE: [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1623074074564-7e14b8f5dc2f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558981403-c5f9891f8f05?auto=format&fit=crop&w=1200&q=80",
  ],
  BICYCLE: [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529422643025-0c9f6f28b8e3?auto=format&fit=crop&w=1200&q=80",
  ],
  ELECTRIC: [
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
  ],
  PICKUP_TRUCK: [
    "https://images.unsplash.com/photo-1592853625511-adf3b4ca2029?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80",
  ],
  SEVEN_SEATER: [
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80",
  ],
};

function getBySeed(list, seed = 0) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.abs(seed) % list.length];
}

function inferTypeGroup(vehicleType = "") {
  const type = normalizeVehicleTypeValue(vehicleType);
  if (type === "MOTORCYCLE") return "MOTORCYCLE";
  if (type === "BICYCLE" || type === "MOUNTAIN_BIKE") return "BICYCLE";
  if (type === "PICKUP_TRUCK" || type === "MINI_TRUCK") return "PICKUP_TRUCK";
  if (type === "SEVEN_SEATER" || type === "SEVEN_SEAT_CAR" || type === "7_SEAT_CAR")
    return "SEVEN_SEATER";
  if (type === "ELECTRIC" || type === "ELECTRIC_BIKE") return "ELECTRIC";
  return "CAR";
}

export function getFallbackCarImage(seed = 0, vehicleType = "CAR") {
  const group = inferTypeGroup(vehicleType);
  const typeImage = getBySeed(TYPE_PLACEHOLDERS[group], seed);
  return typeImage || getBySeed(CAR_PLACEHOLDERS, seed) || CAR_PLACEHOLDERS[0];
}

export function resolveImage(imageUrl, seed = 0, vehicleType = "CAR") {
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    return imageUrl.trim();
  }
  return getFallbackCarImage(seed, vehicleType);
}

export function getVehicleImage(vehicle) {
  const candidates = [vehicle?.images?.[0], vehicle?.image_url, vehicle?.image];
  const found = candidates.find(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
  return found?.trim() || null;
}
