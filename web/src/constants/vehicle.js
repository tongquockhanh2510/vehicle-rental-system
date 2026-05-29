export const VEHICLE_TYPE_OPTIONS = [
  { value: 'CAR', label: 'Ô tô', icon: 'CarFront' },
  { value: 'MOTORBIKE', label: 'Xe máy', icon: 'Bike' },
  { value: 'ELECTRIC_BIKE', label: 'Xe điện', icon: 'Zap' },
  { value: 'BICYCLE', label: 'Xe đạp', icon: 'Bike' },
  { value: 'MOUNTAIN_BIKE', label: 'Xe đạp leo núi', icon: 'Mountain' },
  { value: 'VAN', label: 'Xe van', icon: 'Truck' },
  { value: 'PICKUP_TRUCK', label: 'Xe bán tải', icon: 'Truck' },
  { value: 'MINI_TRUCK', label: 'Xe tải nhỏ', icon: 'Truck' },
  { value: 'LUXURY_CAR', label: 'Xe sang', icon: 'Gem' },
  { value: 'SUV', label: 'SUV', icon: 'CarFront' },
  { value: '7_SEAT_CAR', label: 'Xe 7 chỗ', icon: 'Users' },
  { value: 'SELF_DRIVE_CAR', label: 'Xe tự lái', icon: 'Navigation' },
  { value: 'WITH_DRIVER_CAR', label: 'Xe có tài xế', icon: 'User' }
];

export const FUEL_TYPE_OPTIONS = [
  { value: 'PETROL', label: 'Xăng' },
  { value: 'DIESEL', label: 'Dầu diesel' },
  { value: 'ELECTRIC', label: 'Điện' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'HUMAN_POWERED', label: 'Sức người' }
];

export const TRANSMISSION_OPTIONS = [
  { value: 'AUTOMATIC', label: 'Tự động' },
  { value: 'MANUAL', label: 'Số sàn' },
  { value: 'NONE', label: 'Không áp dụng' }
];

export const VEHICLE_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'RENTED', label: 'Đang cho thuê' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'MAINTENANCE', label: 'Bảo trì' }
];

export function getVehicleTypeLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = VEHICLE_TYPE_OPTIONS.find((item) => item.value === key);
  return found?.label || 'Chưa cập nhật';
}

export function getFuelTypeLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = FUEL_TYPE_OPTIONS.find((item) => item.value === key);
  return found?.label || 'Chưa cập nhật';
}

export function getTransmissionLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = TRANSMISSION_OPTIONS.find((item) => item.value === key);
  return found?.label || 'Chưa cập nhật';
}
