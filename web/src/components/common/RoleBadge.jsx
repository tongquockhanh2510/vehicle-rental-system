import React from 'react';
import { normalizeRole, normalizeOwnerStatus, OWNER_STATUSES, ROLES } from '../../constants/roles';

const roleStyleMap = {
  [ROLES.ADMIN]: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  OWNER_APPROVED: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40',
  OWNER_PENDING: 'bg-amber-500/15 text-amber-200 border-amber-400/40',
  OWNER_REJECTED: 'bg-rose-500/15 text-rose-200 border-rose-400/40',
  [ROLES.USER]: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
};

const roleLabelMap = {
  [ROLES.ADMIN]: 'Quản trị viên',
  OWNER_APPROVED: 'Chủ xe',
  OWNER_PENDING: 'Chủ xe (chờ duyệt)',
  OWNER_REJECTED: 'Chủ xe (bị từ chối)',
  [ROLES.USER]: 'Người thuê'
};

function getDisplayKey(role, ownerStatus) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === ROLES.ADMIN) return ROLES.ADMIN;

  const status = normalizeOwnerStatus(ownerStatus);
  if (status === OWNER_STATUSES.APPROVED) return 'OWNER_APPROVED';
  if (status === OWNER_STATUSES.PENDING) return 'OWNER_PENDING';
  if (status === OWNER_STATUSES.REJECTED) return 'OWNER_REJECTED';
  return ROLES.USER;
}

export default function RoleBadge({ role, ownerStatus }) {
  const key = getDisplayKey(role, ownerStatus);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyleMap[key] || roleStyleMap[ROLES.USER]}`}>
      {roleLabelMap[key] || 'Người thuê'}
    </span>
  );
}
