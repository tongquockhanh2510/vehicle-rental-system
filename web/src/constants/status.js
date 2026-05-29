export const STATUS_STYLES = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  PENDING: 'bg-amber-500/15 text-amber-300 border border-amber-400/40',
  APPROVED: 'bg-blue-500/20 text-blue-200 border border-blue-400/40',
  CONFIRMED: 'bg-blue-500/20 text-blue-200 border border-blue-400/40',
  REJECTED: 'bg-rose-500/15 text-rose-300 border border-rose-400/40',
  ACTIVE: 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/40',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  CANCELLED: 'bg-slate-500/20 text-slate-200 border border-slate-400/30',
  DISPUTED: 'bg-orange-500/20 text-orange-200 border border-orange-400/40',
  REFUNDED: 'bg-violet-500/20 text-violet-200 border border-violet-400/40',
  REVIEWING: 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/40',
  PAID: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/40',
  OUT_OF_BOUNDARY: 'bg-red-500/20 text-red-200 border border-red-400/40',
  IN_BOUNDARY: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  MAINTENANCE: 'bg-slate-500/20 text-slate-200 border border-slate-400/30',
  RENTED: 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40',
  OWNER_PENDING: 'bg-amber-500/15 text-amber-300 border border-amber-400/40',
  OWNER_APPROVED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  OWNER_REJECTED: 'bg-rose-500/15 text-rose-300 border border-rose-400/40',
  OWNER_NONE: 'bg-slate-500/20 text-slate-200 border border-slate-400/30',
  HEALTHY: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  WARNING: 'bg-amber-500/15 text-amber-300 border border-amber-400/40',
  DOWN: 'bg-rose-500/15 text-rose-300 border border-rose-400/40',
  SUSPENDED: 'bg-rose-500/15 text-rose-300 border border-rose-400/40',
  DEFAULT: 'bg-slate-500/20 text-slate-200 border border-slate-400/30'
};

export const STATUS_LABELS = {
  AVAILABLE: 'Sẵn sàng',
  PENDING: 'Chờ xử lý',
  APPROVED: 'Đã duyệt',
  CONFIRMED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  ACTIVE: 'Đang hoạt động',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  DISPUTED: 'Tranh chấp',
  REFUNDED: 'Đã hoàn cọc',
  REVIEWING: 'Đang xem xét',
  PAID: 'Đã thanh toán',
  OUT_OF_BOUNDARY: 'Vượt phạm vi',
  IN_BOUNDARY: 'Trong phạm vi',
  MAINTENANCE: 'Bảo trì',
  RENTED: 'Đang cho thuê',
  OWNER_PENDING: 'Chờ duyệt chủ xe',
  OWNER_APPROVED: 'Đã duyệt chủ xe',
  OWNER_REJECTED: 'Từ chối chủ xe',
  OWNER_NONE: 'Chưa đăng ký chủ xe',
  HEALTHY: 'Ổn định',
  WARNING: 'Cảnh báo',
  DOWN: 'Ngừng hoạt động',
  SUSPENDED: 'Tạm khóa'
};

export function normalizeStatus(status) {
  if (!status) return 'DEFAULT';
  return String(status).toUpperCase();
}

export function getStatusStyle(status) {
  const key = normalizeStatus(status);
  return STATUS_STYLES[key] || STATUS_STYLES.DEFAULT;
}

export function getStatusLabel(status) {
  const key = normalizeStatus(status);
  return STATUS_LABELS[key] || key.replace(/_/g, ' ');
}
