import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CarFront, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { PUBLIC_NAV } from '../../constants/menus';
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
  const { user, role, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-1.5">
            <CarFront className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">RentCar Premium</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Nền tảng thuê xe P2P</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {(isPublic ? PUBLIC_NAV : menu).map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {title ? <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 md:block">{title}</span> : null}
          {isAuthenticated ? (
            <>
              <RoleBadge role={role} />
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 md:flex">
                <span className="text-sm text-white">{user?.first_name || user?.email || 'Tài khoản'}</span>
              </div>
              {!isAdmin && !location.pathname.startsWith('/owner') ? (
                <button
                  type="button"
                  onClick={() => navigate('/owner/dashboard')}
                  className="hidden rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20 md:inline-flex"
                >
                  Cổng chủ xe
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
