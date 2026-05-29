import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import {
  isAdminRole,
  isOwnerApproved,
  isOwnerPending,
  isOwnerRejected,
  normalizeOwnerStatus,
  normalizeRole
} from '../constants/roles';
import { getUserId } from '../utils/formatters';
import {
  clearCurrentUser,
  readCurrentUser,
  resolveOwnerStatusForUser,
  syncCurrentUserRecord,
  upsertUserRecord,
  writeCurrentUser
} from '../utils/authStorage';

const AuthContext = createContext(null);

function normalizeUserPayload(user) {
  if (!user) return null;

  const ownerStatus = resolveOwnerStatusForUser(user);
  return {
    ...user,
    role: normalizeRole(user.role || user.user_role),
    owner_status: normalizeOwnerStatus(ownerStatus)
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const syncedCurrentUser = syncCurrentUserRecord();
    const savedUser = syncedCurrentUser || readCurrentUser();

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      setUser(normalizeUserPayload(savedUser));
    }

    setLoading(false);
  }, []);

  const persistUser = (nextUser, nextToken = token) => {
    const normalized = normalizeUserPayload(nextUser);

    if (normalized) {
      upsertUserRecord(normalized);
      writeCurrentUser(normalized);
      setUser(normalized);
    }

    if (nextToken) {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    }
  };

  const updateUser = (patch) => {
    const next = normalizeUserPayload({ ...(user || {}), ...(patch || {}) });
    if (!next) return;
    upsertUserRecord(next);
    writeCurrentUser(next);
    setUser(next);
  };

  const login = (userData, tokenData) => {
    persistUser(userData, tokenData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    clearCurrentUser();
    setToken('');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile();
      persistUser({ ...(user || {}), ...(response.data || {}) });
    } catch {
      // Keep current user to avoid unnecessary logout on non-critical calls.
    }
  };

  const role = normalizeRole(user?.role);
  const ownerStatus = normalizeOwnerStatus(user);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      ownerStatus,
      isAuthenticated: Boolean(token),
      isAdmin: isAdminRole(role),
      isOwnerApproved: isOwnerApproved(ownerStatus),
      isOwnerPending: isOwnerPending(ownerStatus),
      isOwnerRejected: isOwnerRejected(ownerStatus),
      userId: getUserId(user),
      loading,
      login,
      logout,
      updateUser,
      refreshProfile,
      hasRole: (...roles) => roles.map(normalizeRole).includes(role),
      getDefaultPortalRoute: () => '/'
    }),
    [user, token, role, ownerStatus, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
