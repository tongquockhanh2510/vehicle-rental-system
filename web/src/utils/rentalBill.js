import { calculateDays, formatCurrency, formatDate } from './formatters';

export function normalizeRentalStatus(status) {
  const raw = String(status || '').toUpperCase();
  if (raw === 'CONFIRMED') return 'APPROVED';
  return raw || 'PENDING';
}

export function buildPayoutDisplay(payoutInfo = {}) {
  const method = String(payoutInfo?.method || 'BANK').toUpperCase();
  if (method === 'VISA') {
    const brand = payoutInfo?.card_brand || 'Visa';
    const last4 = payoutInfo?.card_last4 || '----';
    return `${brand} •••• ${last4}`;
  }

  const bank = payoutInfo?.bank_name || 'Ngân hàng';
  const masked = payoutInfo?.masked_account_number || payoutInfo?.bank_account_number || '';
  if (!masked) return bank;
  return `${bank} • ${masked}`;
}

export function getRentalBillPayload(rental = {}) {
  const vehicle = rental?.vehicle_snapshot || {};
  const owner = rental?.owner_snapshot || {};
  const renter = rental?.renter_snapshot || {};
  const pricing = rental?.pricing_snapshot || {};

  const rentalStartDate = rental?.rental_start_date || rental?.start_date;
  const rentalEndDate = rental?.rental_end_date || rental?.end_date;

  const rentalDays =
    Number(pricing?.rental_days) ||
    Number(rental?.total_days) ||
    Math.max(1, calculateDays(rentalStartDate, rentalEndDate));

  const dailyRate = Number(pricing?.daily_rate || rental?.daily_rate || 0);
  const depositAmount = Number(pricing?.deposit_amount || rental?.deposit_amount || 0);
  const rentalAmount = Number(pricing?.rental_amount || dailyRate * rentalDays);
  const platformFee = Number(pricing?.platform_fee || rental?.platform_fee || rentalAmount * 0.04);
  const totalAmount = Number(pricing?.total_amount || rental?.total_amount || rentalAmount + depositAmount + platformFee);

  return {
    rental_id: rental?._id || '',
    status: normalizeRentalStatus(rental?.status),
    note: rental?.notes || rental?.note || '',
    rental_start_date: rentalStartDate,
    rental_end_date: rentalEndDate,
    vehicle: {
      brand: vehicle?.brand || rental?.brand || '',
      model: vehicle?.model || rental?.model || '',
      year: vehicle?.year || rental?.year || '',
      license_plate: vehicle?.license_plate || rental?.license_plate || '',
      vehicle_type: vehicle?.vehicle_type || rental?.vehicle_type || '',
      fuel_type: vehicle?.fuel_type || rental?.fuel_type || '',
      transmission: vehicle?.transmission || rental?.transmission || '',
      seats: vehicle?.seats || rental?.seats || '',
      image:
        vehicle?.image ||
        (Array.isArray(rental?.images) ? rental.images[0] : '') ||
        '',
      pickup_location: vehicle?.pickup_location || rental?.pickup_location || 'Chưa cập nhật',
      return_location: vehicle?.return_location || rental?.return_location || 'Chưa cập nhật'
    },
    owner: {
      name: owner?.name || 'Chủ xe đã xác thực',
      email: owner?.email || '',
      phone: owner?.phone || '',
      payout_info: owner?.payout_info || {}
    },
    renter: {
      name: renter?.name || '',
      email: renter?.email || '',
      phone: renter?.phone || ''
    },
    pricing: {
      rental_days: rentalDays,
      daily_rate: dailyRate,
      deposit_amount: depositAmount,
      rental_amount: rentalAmount,
      platform_fee: platformFee,
      total_amount: totalAmount
    }
  };
}

export const RENTER_REQUEST_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt', statuses: ['PENDING'] },
  { key: 'approved', label: 'Đã duyệt', statuses: ['APPROVED'] },
  { key: 'active', label: 'Đang thuê', statuses: ['ACTIVE'] },
  { key: 'return_requested', label: 'Chờ xác nhận trả xe', statuses: ['RETURN_REQUESTED'] },
  { key: 'completed', label: 'Hoàn tất', statuses: ['COMPLETED'] },
  { key: 'rejected_cancelled', label: 'Bị từ chối/Hủy', statuses: ['REJECTED', 'CANCELLED'] },
  { key: 'disputed', label: 'Tranh chấp', statuses: ['DISPUTED'] }
];

export function filterRentalsByTab(rows = [], tab = 'all') {
  if (!Array.isArray(rows)) return [];
  if (tab === 'all') return rows;

  const selected = RENTER_REQUEST_TABS.find((item) => item.key === tab);
  if (!selected?.statuses?.length) return rows;

  const allowed = new Set(selected.statuses);
  return rows.filter((row) => allowed.has(normalizeRentalStatus(row?.status)));
}

export function describeBillPeriod(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getPricingRows(pricing = {}) {
  return [
    { label: 'Số ngày thuê', value: `${pricing.rental_days || 0} ngày` },
    { label: 'Giá thuê/ngày', value: formatCurrency(pricing.daily_rate || 0) },
    { label: 'Tiền thuê', value: formatCurrency(pricing.rental_amount || 0) },
    { label: 'Phí nền tảng (4%)', value: formatCurrency(pricing.platform_fee || 0) },
    { label: 'Tiền cọc', value: formatCurrency(pricing.deposit_amount || 0) }
  ];
}

