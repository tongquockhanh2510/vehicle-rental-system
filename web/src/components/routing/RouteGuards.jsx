import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole, OWNER_STATUSES, ROLES } from '../../constants/roles';

export function ProtectedRoute({ children }) {
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

export function OwnerProtectedRoute({ children }) {
  const { isAuthenticated, loading, ownerStatus } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-slate-300">Đang tải quyền truy cập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (ownerStatus !== OWNER_STATUSES.APPROVED) {
    return <Navigate to="/app/owner-application-status" replace />;
  }

  return children;
}

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-slate-300">Đang tải quyền quản trị...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (normalizeRole(role) !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function RequireAuth({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
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
    if (normalizeRole(role) === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export function RequireOwnerApproved({ children }) {
  return <OwnerProtectedRoute>{children}</OwnerProtectedRoute>;
}
