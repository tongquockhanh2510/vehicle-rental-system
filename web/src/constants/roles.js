export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  OWNER: 'OWNER'
};

export const PORTALS = {
  PUBLIC: 'PUBLIC',
  RENTER: 'RENTER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN'
};

export function normalizeRole(role) {
  if (!role) return ROLES.USER;
  const value = String(role).toUpperCase();
  if (value.includes('ADMIN')) return ROLES.ADMIN;
  if (value.includes('OWNER')) return ROLES.OWNER;
  return ROLES.USER;
}

export function isAdminRole(role) {
  return normalizeRole(role) === ROLES.ADMIN;
}
