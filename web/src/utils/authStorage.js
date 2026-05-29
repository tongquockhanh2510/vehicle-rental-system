import { normalizeOwnerStatus } from '../constants/roles';

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CURRENT_USER: 'rentcar_current_user',
  USERS: 'rentcar_users',
  OWNER_APPLICATIONS: 'rentcar_owner_applications',
  OWNER_APPLICATIONS_LEGACY: 'mock_owner_applications_v1'
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getId(value) {
  return value?._id || value?.id || value?.user_id || '';
}

function getEmail(value) {
  return value?.email || value?.user_email || value?.applicant_email || '';
}

export function isSameUser(user, ref) {
  if (!user || !ref) return false;
  const userId = normalizeText(getId(user));
  const refId = normalizeText(getId(ref) || ref);
  if (userId && refId && userId === refId) return true;

  const userEmail = normalizeText(getEmail(user));
  const refEmail = normalizeText(getEmail(ref) || ref);
  if (userEmail && refEmail && userEmail === refEmail) return true;

  return false;
}

export function readCurrentUser() {
  const legacy = readJson(STORAGE_KEYS.USER, null);
  if (legacy) return legacy;
  return readJson(STORAGE_KEYS.CURRENT_USER, null);
}

export function writeCurrentUser(user) {
  if (!user) return;
  writeJson(STORAGE_KEYS.USER, user);
  writeJson(STORAGE_KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function readUsers() {
  const rows = readJson(STORAGE_KEYS.USERS, []);
  return Array.isArray(rows) ? rows : [];
}

export function writeUsers(rows = []) {
  writeJson(STORAGE_KEYS.USERS, Array.isArray(rows) ? rows : []);
}

export function upsertUserRecord(user) {
  if (!user) return null;
  const rows = readUsers();
  const index = rows.findIndex((item) => isSameUser(item, user));
  const nextUser = index >= 0 ? { ...rows[index], ...user } : user;

  if (index >= 0) {
    rows[index] = nextUser;
  } else {
    rows.unshift(nextUser);
  }

  writeUsers(rows);
  return nextUser;
}

export function patchUserRecord(ref, patch = {}) {
  const rows = readUsers();
  let updated = null;
  const next = rows.map((item) => {
    if (!isSameUser(item, ref)) return item;
    updated = { ...item, ...patch };
    return updated;
  });
  writeUsers(next);
  return updated;
}

export function findUserRecord(ref) {
  return readUsers().find((item) => isSameUser(item, ref)) || null;
}

export function readOwnerApplications() {
  const primary = readJson(STORAGE_KEYS.OWNER_APPLICATIONS, []);
  if (Array.isArray(primary) && primary.length) return primary;
  const legacy = readJson(STORAGE_KEYS.OWNER_APPLICATIONS_LEGACY, []);
  return Array.isArray(legacy) ? legacy : [];
}

export function writeOwnerApplications(rows = []) {
  const payload = Array.isArray(rows) ? rows : [];
  writeJson(STORAGE_KEYS.OWNER_APPLICATIONS, payload);
  writeJson(STORAGE_KEYS.OWNER_APPLICATIONS_LEGACY, payload);
}

export function upsertOwnerApplicationRecord(app) {
  if (!app) return null;
  const rows = readOwnerApplications();
  const index = rows.findIndex((item) => String(item?._id || '') === String(app?._id || ''));
  const nextApp = index >= 0 ? { ...rows[index], ...app } : app;

  if (index >= 0) {
    rows[index] = nextApp;
  } else {
    rows.unshift(nextApp);
  }

  writeOwnerApplications(rows);
  return nextApp;
}

export function patchOwnerApplicationRecord(applicationId, patch = {}) {
  const rows = readOwnerApplications();
  let updated = null;
  const next = rows.map((item) => {
    if (String(item?._id || '') !== String(applicationId || '')) return item;
    updated = { ...item, ...patch };
    return updated;
  });
  writeOwnerApplications(next);
  return updated;
}

export function findOwnerApplicationByUser(ref) {
  return (
    readOwnerApplications().find((item) => {
      if (!item) return false;
      if (isSameUser({ _id: item.user_id, email: item.email }, ref)) return true;
      return false;
    }) || null
  );
}

export function resolveOwnerStatusForUser(user) {
  if (!user) return normalizeOwnerStatus('NONE');

  const fromApp = normalizeOwnerStatus(findOwnerApplicationByUser(user)?.status);
  if (fromApp !== 'NONE') return fromApp;

  const fromStoredUser = normalizeOwnerStatus(findUserRecord(user));
  if (fromStoredUser !== 'NONE') return fromStoredUser;

  return normalizeOwnerStatus(user);
}

export function syncCurrentUserRecord() {
  const current = readCurrentUser();
  if (!current) return null;
  const stored = findUserRecord(current);
  if (!stored) return current;
  const next = { ...current, ...stored };
  writeCurrentUser(next);
  return next;
}
