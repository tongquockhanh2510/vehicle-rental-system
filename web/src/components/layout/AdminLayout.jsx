import React, { useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search, ShieldCheck } from 'lucide-react';
import AppLayout from './AppLayout';
import IconResolver from '../navigation/IconResolver';
import { ADMIN_MENU } from '../../constants/navigationConfig';
import { useAuth } from '../../context/AuthContext';

function getRouteTitle(pathname) {
  const exact = ADMIN_MENU.find((item) => item.to === pathname);
  if (exact) return exact.label;

  const partial = ADMIN_MENU.find((item) => pathname.startsWith(`${item.to}/`));
  if (partial) return partial.label;

  return 'Admin Control Center';
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const routeTitle = useMemo(() => getRouteTitle(location.pathname), [location.pathname]);

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-screen w-full max-w-[1700px]">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/80 px-4 py-5 lg:flex">
          <Link to="/admin/dashboard" className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
            <p className="text-lg font-bold text-white">RentCar Admin</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200">Admin Control Center</p>
          </Link>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quản trị viên</p>
            <p className="mt-1 text-sm font-semibold text-white">{user?.first_name || user?.email || 'Admin'}</p>
            <span className="mt-2 inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-200">
              ADMIN
            </span>
          </div>

          <nav className="mt-4 space-y-1">
            {ADMIN_MENU.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'border border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                      : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <IconResolver name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{routeTitle}</p>
                <p className="text-xs text-slate-400">Giám sát hệ thống microservices, người dùng và vận hành nền tảng.</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="hidden items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 md:flex">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm toàn hệ thống"
                    className="w-52 bg-transparent text-sm text-white outline-none"
                  />
                </label>

                <button className="rounded-xl border border-white/15 p-2 text-slate-200 transition hover:bg-white/10" type="button">
                  <Bell className="h-4 w-4" />
                </button>

                <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  <span className="text-sm text-white">{user?.first_name || 'Admin'}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-16 pt-6 md:px-6 md:pt-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
