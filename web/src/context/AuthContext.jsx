import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import {
  isAdminRole,
  isOwnerApproved,
  isOwnerPending,
  isOwnerRejected,
  normalizeOwnerStatus,
  normalizeRole,
  OWNER_STATUSES,
  ROLES
} from '../constants/roles';
import { getUserId } from '../utils/formatters';

const AuthContext = createContext(null);

function normalizeUserPayload(user) {
  if (!user) return null;
  return {
    ...user,
    role: normalizeRole(user.role),
    owner_status: normalizeOwnerStatus(user.owner_status)
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(normalizeUserPayload(JSON.parse(savedUser)));
      } catch {
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const persistUser = (nextUser, nextToken = token) => {
    const normalized = normalizeUserPayload(nextUser);

    if (normalized) {
      localStorage.setItem('user', JSON.stringify(normalized));
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
    localStorage.setItem('user', JSON.stringify(next));
    setUser(next);
  };

  const login = (userData, tokenData) => {
    persistUser(userData, tokenData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
  const ownerStatus = normalizeOwnerStatus(user?.owner_status);

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
      getDefaultPortalRoute: () => {
        if (role === ROLES.ADMIN) return '/admin/dashboard';
        if (ownerStatus === OWNER_STATUSES.APPROVED) return '/app/explore';
        return '/app/explore';
      }
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
