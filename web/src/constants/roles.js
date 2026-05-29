export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

export const PORTALS = {
  PUBLIC: 'PUBLIC',
  RENTER: 'RENTER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN'
};

export const OWNER_STATUSES = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export function normalizeRole(role) {
  if (!role) return ROLES.USER;
  const value = String(role).toUpperCase();
  if (value.includes('ADMIN')) return ROLES.ADMIN;
  return ROLES.USER;
}

export function isAdminRole(role) {
  return normalizeRole(role) === ROLES.ADMIN;
}

export function normalizeOwnerStatus(status) {
  if (!status) return OWNER_STATUSES.NONE;
  const value = String(status).toUpperCase();
  if (value.includes('APPROVED')) return OWNER_STATUSES.APPROVED;
  if (value.includes('PENDING')) return OWNER_STATUSES.PENDING;
  if (value.includes('REJECTED')) return OWNER_STATUSES.REJECTED;
  return OWNER_STATUSES.NONE;
}

export function isOwnerApproved(status) {
  return normalizeOwnerStatus(status) === OWNER_STATUSES.APPROVED;
}

export function isOwnerPending(status) {
  return normalizeOwnerStatus(status) === OWNER_STATUSES.PENDING;
}

export function isOwnerRejected(status) {
  return normalizeOwnerStatus(status) === OWNER_STATUSES.REJECTED;
}
