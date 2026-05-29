export function formatCurrency(value) {
  const numeric = Number(value || 0);
  return `${numeric.toLocaleString('vi-VN')} VND`;
}

export function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculateDays(start, end) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  const diff = endDate.getTime() - startDate.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

export function toPercent(value) {
  const numeric = Number(value || 0);
  return `${numeric.toFixed(1)}%`;
}

export function compactId(value) {
  if (!value) return '--';
  const text = String(value);
  if (text.length <= 12) return text;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

export function pickArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.vehicles)) return data.vehicles;
  if (Array.isArray(data?.contracts)) return data.contracts;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function getUserId(user) {
  return user?.id || user?._id || user?.user_id || null;
}
