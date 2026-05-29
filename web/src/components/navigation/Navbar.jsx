import React, { useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CarFront, LogOut, Menu, ShieldCheck, SwitchCamera } from 'lucide-react';
import { PUBLIC_NAV } from '../../constants/menus';
import { OWNER_STATUSES } from '../../constants/roles';
import RoleBadge from '../common/RoleBadge';
import { useAuth } from '../../context/AuthContext';

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm transition ${
          isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar({ menu = [], isPublic = false, title }) {
  const {
    user,
    role,
    ownerStatus,
    isAuthenticated,
    isAdmin,
    isOwnerApproved,
    isOwnerPending,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const publicNav = useMemo(() => {
    if (!isAuthenticated) return PUBLIC_NAV;

    return PUBLIC_NAV.map((item) => {
      if (item.to === '/become-owner') {
        if (ownerStatus === OWNER_STATUSES.APPROVED) {
          return { ...item, label: 'Cổng chủ xe', to: '/owner/dashboard' };
        }
        if (ownerStatus === OWNER_STATUSES.PENDING) {
          return { ...item, label: 'Hồ sơ chủ xe', to: '/app/owner-application-status' };
        }
        return { ...item, label: 'Đăng ký làm chủ xe', to: '/app/become-owner' };
      }
      if (item.to === '/how-it-works') {
        return { ...item, to: '/how-it-works' };
      }
      return item;
    });
  }, [isAuthenticated, ownerStatus]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-1.5">
            <CarFront className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">RentCar Premium</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Nền tảng thuê phương tiện P2P</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {(isPublic ? publicNav : menu).map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {title ? <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 md:block">{title}</span> : null}
          {isAuthenticated ? (
            <>
              <RoleBadge role={role} ownerStatus={ownerStatus} />
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 md:flex">
                <span className="text-sm text-white">{user?.first_name || user?.email || 'Tài khoản'}</span>
              </div>

              {!isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate('/app')}
                  className="hidden rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 md:inline-flex"
                >
                  Cổng người thuê
                </button>
              ) : null}

              {!isAdmin && isOwnerApproved ? (
                <button
                  type="button"
                  onClick={() => navigate('/owner/dashboard')}
                  className="hidden items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20 md:inline-flex"
                >
                  <SwitchCamera className="h-3.5 w-3.5" /> Cổng chủ xe
                </button>
              ) : null}

              {!isAdmin && !isOwnerApproved ? (
                <button
                  type="button"
                  onClick={() => navigate(isOwnerPending ? '/app/owner-application-status' : '/app/become-owner')}
                  className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold transition md:inline-flex ${
                    isOwnerPending
                      ? 'border border-amber-400/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
                      : 'border border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20'
                  }`}
                >
                  {isOwnerPending ? 'Hồ sơ chủ xe đang duyệt' : 'Đăng ký làm chủ xe'}
                </button>
              ) : null}

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 md:inline-flex"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Quản trị
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="rounded-full border border-white/15 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-400"
              >
                Đăng ký
              </Link>
            </>
          )}
          <button className="rounded-full border border-white/15 p-2 text-slate-300 lg:hidden" aria-label="Mở menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
