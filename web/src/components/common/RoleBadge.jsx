import React from 'react';
import { normalizeRole, ROLES } from '../../constants/roles';

const roleStyleMap = {
  [ROLES.ADMIN]: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  [ROLES.OWNER]: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
  [ROLES.USER]: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
};

const roleLabelMap = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.OWNER]: 'Chủ xe',
  [ROLES.USER]: 'Người thuê'
};

export default function RoleBadge({ role }) {
  const key = normalizeRole(role);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyleMap[key] || roleStyleMap[ROLES.USER]}`}>
      {roleLabelMap[key] || 'Người thuê'}
    </span>
  );
}
