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
    return `${brand} ****${last4}`;
  }

  const bank = payoutInfo?.bank_name || 'Ngân hàng';
  const masked = payoutInfo?.masked_account_number || '';
  if (!masked) return bank;
  return `${bank} • ${masked}`;
}

export function formatBankAccount(accountNumber, mode = 'full') {
  const raw = String(accountNumber || '').trim();
  if (!raw) return 'Chưa cập nhật';

  if (mode === 'masked') {
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `••••${digits.slice(-4)}`;
    }
    return raw.length > 4 ? `••••${raw.slice(-4)}` : raw;
  }

  return raw;
}

export function getTransferAccountNumber(payoutInfo = {}) {
  return (
    payoutInfo?.bank_account_number ||
    payoutInfo?.account_number ||
    ''
  );
}

const BANK_CODE_MAP = {
  VIETCOMBANK: 'VCB',
  VCB: 'VCB',
  TECHCOMBANK: 'TCB',
  TCB: 'TCB',
  ACB: 'ACB',
  AGRIBANK: 'VBA',
  BIDV: 'BIDV',
  VIETINBANK: 'CTG',
  MB: 'MB',
  MBBANK: 'MB',
  SACOMBANK: 'STB',
  TPBANK: 'TPB',
  VPBANK: 'VPB',
  OCB: 'OCB'
};

function normalizeBankCode(input = '') {
  const key = String(input || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  return BANK_CODE_MAP[key] || '';
}

export function validateQrPayload(payoutInfo = {}, amount = 0, addInfo = '') {
  const accountNumber = getTransferAccountNumber(payoutInfo).replace(/\s+/g, '');
  const bankCode = normalizeBankCode(payoutInfo?.bank_code) || normalizeBankCode(payoutInfo?.bank_name);
  const numericAmount = Math.max(0, Math.round(Number(amount || 0)));
  const transferContent = String(addInfo || '').trim();

  if (!bankCode) {
    return {
      ok: false,
      reason: 'Chưa thể tạo QR vì thiếu mã ngân hàng (`bank_code`).',
      bankCode: '',
      accountNumber,
      amount: numericAmount,
      transferContent
    };
  }
  if (!accountNumber) {
    return {
      ok: false,
      reason: 'Chưa thể tạo QR vì thiếu số tài khoản chủ xe.',
      bankCode,
      accountNumber: '',
      amount: numericAmount,
      transferContent
    };
  }
  if (!/^\d{6,}$/.test(accountNumber)) {
    return {
      ok: false,
      reason: 'Chưa thể tạo QR vì số tài khoản chủ xe không hợp lệ.',
      bankCode,
      accountNumber,
      amount: numericAmount,
      transferContent
    };
  }
  if (numericAmount <= 0) {
    return {
      ok: false,
      reason: 'Chưa thể tạo QR vì tổng tiền thanh toán chưa hợp lệ.',
      bankCode,
      accountNumber,
      amount: numericAmount,
      transferContent
    };
  }
  if (!transferContent) {
    return {
      ok: false,
      reason: 'Chưa thể tạo QR vì thiếu nội dung chuyển khoản.',
      bankCode,
      accountNumber,
      amount: numericAmount,
      transferContent
    };
  }

  return {
    ok: true,
    reason: '',
    bankCode,
    accountNumber,
    amount: numericAmount,
    transferContent
  };
}

export function buildVietQrUrl(payoutInfo = {}, amount = 0, addInfo = '') {
  const validation = validateQrPayload(payoutInfo, amount, addInfo);
  if (!validation.ok) return '';

  const encodedName = encodeURIComponent(payoutInfo?.bank_account_holder || 'CHU XE');
  const encodedInfo = encodeURIComponent(validation.transferContent || 'RENTCAR PAYMENT');

  return `https://img.vietqr.io/image/${validation.bankCode}-${validation.accountNumber}-compact2.png?amount=${validation.amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
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
  const totalAmount = Number(
    pricing?.total_amount || rental?.total_amount || rentalAmount + depositAmount + platformFee
  );

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
      image: vehicle?.image || (Array.isArray(rental?.images) ? rental.images[0] : '') || '',
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
