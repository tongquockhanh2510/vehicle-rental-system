import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { isAdminRole, normalizeRole, ROLES } from '../constants/roles';
import { getUserId } from '../utils/formatters';

const AuthContext = createContext(null);

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
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const persistUser = (nextUser, nextToken = token) => {
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }

    if (nextToken) {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    }
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

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(token),
      isAdmin: isAdminRole(role),
      userId: getUserId(user),
      loading,
      login,
      logout,
      refreshProfile,
      hasRole: (...roles) => roles.map(normalizeRole).includes(role),
      getDefaultPortalRoute: () => (role === ROLES.ADMIN ? '/admin/dashboard' : '/app/explore')
    }),
    [user, token, role, loading]
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
