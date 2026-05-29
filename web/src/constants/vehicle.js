export const VEHICLE_TYPE_OPTIONS = [
  { value: 'CAR', label: 'Ã” tÃ´', icon: 'CarFront' },
  { value: 'MOTORCYCLE', label: 'Xe mÃ¡y', icon: 'Bike' },
  { value: 'ELECTRIC_BIKE', label: 'Xe Ä‘iá»‡n', icon: 'Zap' },
  { value: 'BICYCLE', label: 'Xe Ä‘áº¡p', icon: 'Bike' },
  { value: 'MOUNTAIN_BIKE', label: 'Xe Ä‘áº¡p leo nÃºi', icon: 'Mountain' },
  { value: 'SUV', label: 'SUV', icon: 'CarFront' },
  { value: 'SEVEN_SEATER', label: 'Xe 7 chá»—', icon: 'Users' },
  { value: 'PICKUP_TRUCK', label: 'Xe bÃ¡n táº£i', icon: 'Truck' },
  { value: 'MINI_TRUCK', label: 'Xe táº£i nhá»', icon: 'Truck' },
  { value: 'LUXURY_CAR', label: 'Xe sang', icon: 'Gem' },
  { value: 'SELF_DRIVE_CAR', label: 'Xe tá»± lÃ¡i', icon: 'Navigation' },
  { value: 'WITH_DRIVER_CAR', label: 'Xe cÃ³ tÃ i xáº¿', icon: 'User' },
  { value: 'OTHER', label: 'KhÃ¡c', icon: 'CircleEllipsis' }
];

export const FUEL_TYPE_OPTIONS = [
  { value: 'PETROL', label: 'XÄƒng' },
  { value: 'DIESEL', label: 'Dáº§u diesel' },
  { value: 'ELECTRIC', label: 'Äiá»‡n' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'HUMAN_POWERED', label: 'Sá»©c ngÆ°á»i' }
];

export const TRANSMISSION_OPTIONS = [
  { value: 'AUTOMATIC', label: 'Tá»± Ä‘á»™ng' },
  { value: 'MANUAL', label: 'Sá»‘ sÃ n' },
  { value: 'NONE', label: 'KhÃ´ng Ã¡p dá»¥ng' }
];

export const VEHICLE_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Sáºµn sÃ ng' },
  { value: 'RENTED', label: 'Äang cho thuÃª' },
  { value: 'PENDING', label: 'Chá» duyá»‡t' },
  { value: 'MAINTENANCE', label: 'Báº£o trÃ¬' }
];

const VEHICLE_TYPE_ALIAS_MAP = {
  MOTORBIKE: 'MOTORCYCLE',
  MOTORCYCLE: 'MOTORCYCLE',
  SEVEN_SEAT_CAR: 'SEVEN_SEATER',
  '7_SEAT_CAR': 'SEVEN_SEATER',
  SEVEN_SEATER: 'SEVEN_SEATER',
  VAN: 'OTHER',
  TRUCK: 'MINI_TRUCK'
};

export function normalizeVehicleTypeValue(value) {
  const raw = String(value || '').toUpperCase();
  if (!raw) return '';
  return VEHICLE_TYPE_ALIAS_MAP[raw] || raw;
}

export function getVehicleTypeLabel(value) {
  const key = normalizeVehicleTypeValue(value);
  const found = VEHICLE_TYPE_OPTIONS.find((item) => item.value === key);
  return found?.label || 'ChÆ°a cáº­p nháº­t';
}

export function getFuelTypeLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = FUEL_TYPE_OPTIONS.find((item) => item.value === key);
  return found?.label || 'ChÆ°a cáº­p nháº­t';
}

export function getTransmissionLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = TRANSMISSION_OPTIONS.find((item) => item.value === key);
  return found?.label || 'ChÆ°a cáº­p nháº­t';
}
