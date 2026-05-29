import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole, OWNER_STATUSES } from '../../constants/roles';

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-sm text-slate-300">Đang tải phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function RequireRole({ children, roles = [] }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.length) {
    return children;
  }

  const normalized = roles.map(normalizeRole);
  if (!normalized.includes(normalizeRole(role))) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

export function RequireOwnerApproved({ children }) {
  const { isAuthenticated, ownerStatus } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (ownerStatus === OWNER_STATUSES.APPROVED) {
    return children;
  }

  if (ownerStatus === OWNER_STATUSES.PENDING) {
    return <Navigate to="/app/owner-application-status" replace />;
  }

  if (ownerStatus === OWNER_STATUSES.REJECTED) {
    return <Navigate to="/app/become-owner" replace />;
  }

  return <Navigate to="/app/become-owner" replace />;
}
