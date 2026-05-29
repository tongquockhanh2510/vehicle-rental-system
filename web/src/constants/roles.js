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

export function extractOwnerStatus(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;

  return (
    source.owner_status ||
    source.ownerStatus ||
    source.owner_application_status ||
    source.ownerApplicationStatus ||
    source.status ||
    ''
  );
}

export function normalizeOwnerStatus(source) {
  const raw = extractOwnerStatus(source);
  if (!raw) return OWNER_STATUSES.NONE;

  const value = String(raw).toUpperCase();
  if (value.includes('APPROVED')) return OWNER_STATUSES.APPROVED;
  if (value.includes('PENDING') || value.includes('UNDER_REVIEW')) return OWNER_STATUSES.PENDING;
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
