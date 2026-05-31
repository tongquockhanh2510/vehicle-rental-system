export const CITY_OPTIONS = [
  { value: '', label: 'Tất cả thành phố' },
  { value: 'TP.HCM', label: 'TP.HCM' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng (sắp mở)' }
];

export const DISTRICT_OPTIONS_BY_CITY = {
  'TP.HCM': [
    'Quận 1',
    'Quận 3',
    'Bình Thạnh',
    'Gò Vấp',
    'Tân Bình',
    'Thủ Đức',
    'Phú Nhuận',
    'Quận 7'
  ],
  'Hà Nội': [
    'Hoàn Kiếm',
    'Ba Đình',
    'Đống Đa',
    'Cầu Giấy',
    'Hà Đông',
    'Nam Từ Liêm',
    'Thanh Xuân',
    'Tây Hồ'
  ],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn']
};

export const PICKUP_AREA_OPTIONS_BY_CITY = {
  'TP.HCM': [
    'Sân bay Tân Sơn Nhất',
    'Ga Sài Gòn',
    'Bến xe Miền Đông mới',
    'Landmark 81',
    'Phú Mỹ Hưng'
  ],
  'Hà Nội': [
    'Sân bay Nội Bài',
    'Ga Hà Nội',
    'Mỹ Đình',
    'Hồ Gươm',
    'Keangnam'
  ],
  'Đà Nẵng': ['Sân bay Đà Nẵng', 'Cầu Rồng', 'Biển Mỹ Khê']
};

export function getDistrictOptions(city) {
  const rows = DISTRICT_OPTIONS_BY_CITY[city] || [];
  return [{ value: '', label: 'Tất cả quận/huyện' }, ...rows.map((item) => ({ value: item, label: item }))];
}

export function getPickupAreaOptions(city) {
  const rows = PICKUP_AREA_OPTIONS_BY_CITY[city] || [];
  return [{ value: '', label: 'Tất cả khu vực nhận xe' }, ...rows.map((item) => ({ value: item, label: item }))];
}

export function normalizeLocationText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
