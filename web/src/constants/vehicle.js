export const VEHICLE_TYPE_OPTIONS = [
  { value: "CAR", label: "Ô tô", icon: "CarFront" },
  { value: "MOTORCYCLE", label: "Xe máy", icon: "Bike" },
  { value: "BICYCLE", label: "Xe đạp", icon: "Bike" },
  { value: "PICKUP_TRUCK", label: "Xe bán tải", icon: "Truck" },
  { value: "SEVEN_SEATER", label: "Xe 7 chỗ", icon: "Users" },
  { value: "OTHER", label: "Khác", icon: "CircleEllipsis" },
];

export const VEHICLE_TYPE_FILTER_OPTIONS = [
  { value: "CAR", label: "Ô tô", icon: "CarFront" },
  { value: "MOTORCYCLE", label: "Xe máy", icon: "Bike" },
  { value: "ELECTRIC", label: "Xe điện", icon: "Zap" },
  { value: "BICYCLE", label: "Xe đạp", icon: "Bike" },
  { value: "PICKUP_TRUCK", label: "Xe bán tải", icon: "Truck" },
  { value: "SEVEN_SEATER", label: "Xe 7 chỗ", icon: "Users" },
];

const VEHICLE_TYPE_META = [
  ...VEHICLE_TYPE_FILTER_OPTIONS,
  { value: "OTHER", label: "Khác", icon: "CircleEllipsis" },
  { value: "SUV", label: "SUV", icon: "CarFront" },
  { value: "MINI_TRUCK", label: "Xe tải nhỏ", icon: "Truck" },
  { value: "LUXURY_CAR", label: "Xe sang", icon: "CarFront" },
  { value: "SELF_DRIVE_CAR", label: "Xe tự lái", icon: "CarFront" },
  { value: "WITH_DRIVER_CAR", label: "Xe có tài xế", icon: "CarFront" },
  { value: "MOUNTAIN_BIKE", label: "Xe đạp leo núi", icon: "Bike" },
];

export const FUEL_TYPE_OPTIONS = [
  { value: "PETROL", label: "Xăng" },
  { value: "DIESEL", label: "Dầu diesel" },
  { value: "ELECTRIC", label: "Điện" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "HUMAN_POWERED", label: "Sức người" },
];

export const TRANSMISSION_OPTIONS = [
  { value: "AUTOMATIC", label: "Tự động" },
  { value: "MANUAL", label: "Số sàn" },
  { value: "NONE", label: "Không áp dụng" },
];

export const VEHICLE_STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "RENTED", label: "Đang cho thuê" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "MAINTENANCE", label: "Bảo trì" },
];

const VEHICLE_TYPE_ALIAS_MAP = {
  MOTORBIKE: "MOTORCYCLE",
  ELECTRIC_BIKE: "ELECTRIC",
  SEVEN_SEAT_CAR: "SEVEN_SEATER",
  "7_SEAT_CAR": "SEVEN_SEATER",
  VAN: "CAR",
  TRUCK: "PICKUP_TRUCK",
};

export function normalizeVehicleTypeValue(value) {
  const raw = String(value || "").toUpperCase();
  if (!raw) return "";
  return VEHICLE_TYPE_ALIAS_MAP[raw] || raw;
}

export function isElectricVehicle(vehicle = {}) {
  const type = normalizeVehicleTypeValue(vehicle.vehicle_type);
  const fuelType = String(vehicle.fuel_type || "").toUpperCase();
  return type === "ELECTRIC" || fuelType === "ELECTRIC";
}

export function matchesVehicleTypeFilter(vehicle = {}, selectedType = "") {
  const filterType = normalizeVehicleTypeValue(selectedType);
  if (!filterType) return true;

  const type = normalizeVehicleTypeValue(vehicle.vehicle_type);
  if (filterType === "ELECTRIC") return isElectricVehicle(vehicle);

  if (filterType === "CAR") {
    return [
      "CAR",
      "SUV",
      "LUXURY_CAR",
      "SELF_DRIVE_CAR",
      "WITH_DRIVER_CAR",
      "VAN",
    ].includes(type);
  }

  if (filterType === "MOTORCYCLE") return ["MOTORCYCLE"].includes(type);
  if (filterType === "BICYCLE")
    return ["BICYCLE", "MOUNTAIN_BIKE"].includes(type);
  if (filterType === "PICKUP_TRUCK")
    return ["PICKUP_TRUCK", "MINI_TRUCK", "TRUCK"].includes(type);
  if (filterType === "SEVEN_SEATER")
    return ["SEVEN_SEATER", "SEVEN_SEAT_CAR", "7_SEAT_CAR"].includes(type);

  return type === filterType;
}

export function toBackendVehicleTypeFilter(value) {
  const normalized = normalizeVehicleTypeValue(value);
  if (!normalized || normalized === "ELECTRIC") return "";
  return normalized;
}

export function getVehicleTypeMeta(value) {
  const key = normalizeVehicleTypeValue(value);
  return VEHICLE_TYPE_META.find((item) => item.value === key) || null;
}

export function getVehicleTypeLabel(value) {
  const meta = getVehicleTypeMeta(value);
  return meta?.label || "Chưa cập nhật";
}

export function getFuelTypeLabel(value) {
  const key = String(value || "").toUpperCase();
  const found = FUEL_TYPE_OPTIONS.find((item) => item.value === key);
  return found?.label || "Chưa cập nhật";
}

export function getTransmissionLabel(value) {
  const key = String(value || "").toUpperCase();
  const found = TRANSMISSION_OPTIONS.find((item) => item.value === key);
  return found?.label || "Chưa cập nhật";
}
