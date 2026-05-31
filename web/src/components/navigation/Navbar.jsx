import React, { useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CarFront, LogOut, Menu, ShieldCheck, SwitchCamera } from 'lucide-react';
import { PUBLIC_NAV } from '../../constants/navigationConfig';
import RoleBadge from '../common/RoleBadge';
import { useAuth } from '../../context/AuthContext';
import { getOwnerCta, getOwnerStatusHint } from '../../utils/ownerCta';

function NavItem({ to, label }) {
  const useExactMatch =
    to === '/' ||
    to === '/app' ||
    to === '/owner/dashboard' ||
    to === '/admin/dashboard';

  return (
    <NavLink
      to={to}
      end={useExactMatch}
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

export default function Navbar({
  menu = [],
  isPublic = false,
  title,
  showOwnerAction = true,
  showRoleBadge = true
}) {
  const { user, role, ownerStatus, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const ownerAction = useMemo(() => getOwnerCta(user, ownerStatus), [user, ownerStatus]);

  const publicNav = useMemo(() => {
    if (isAdmin) return [];
    if (!isAuthenticated) {
      return PUBLIC_NAV.map((item) => {
        if (item.to === '/become-owner') {
          const guestOwnerAction = getOwnerCta(null, null);
          return { ...item, label: guestOwnerAction.label, to: guestOwnerAction.to };
        }
        return item;
      });
    }

    const base = PUBLIC_NAV.map((item) => {
      if (item.to === '/become-owner') {
        return { ...item, label: ownerAction.label, to: ownerAction.to };
      }
      return item;
    });

    return [{ label: 'Dịch vụ của tôi', to: '/app' }, ...base];
  }, [isAuthenticated, ownerAction, isAdmin]);

  const ownerToneClass =
    ownerAction.tone === 'amber'
      ? 'border border-amber-400/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
      : ownerAction.tone === 'rose'
        ? 'border border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20'
        : ownerAction.tone === 'blue'
          ? 'border border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20'
          : 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20';

  const ownerStatusHint = !isAdmin ? getOwnerStatusHint(ownerStatus) : '';

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
          {title ? <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 xl:block">{title}</span> : null}
          {isAuthenticated ? (
            <>
              {showRoleBadge ? <RoleBadge role={role} ownerStatus={ownerStatus} /> : null}
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 md:flex">
                <div className="flex flex-col">
                  <span className="text-sm text-white">{user?.first_name || user?.email || 'Tài khoản'}</span>
                  {ownerStatusHint ? <span className="text-[10px] text-slate-400">{ownerStatusHint}</span> : null}
                </div>
              </div>

              {!isAdmin && showOwnerAction ? (
                <button
                  type="button"
                  onClick={() => navigate(ownerAction.to)}
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition ${ownerToneClass}`}
                >
                  {ownerAction.tone === 'blue' ? (
                    <span className="inline-flex items-center gap-1">
                      <SwitchCamera className="h-3.5 w-3.5" />
                      {ownerAction.label}
                    </span>
                  ) : (
                    ownerAction.label
                  )}
                </button>
              ) : null}

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 lg:inline-flex"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin Control Center
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
