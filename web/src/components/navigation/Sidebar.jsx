import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronRight, LogOut } from 'lucide-react';
import IconResolver from './IconResolver';
import RoleBadge from '../common/RoleBadge';
import { useAuth } from '../../context/AuthContext';

function getInitials(user) {
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Owner';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Sidebar({ menu = [], title = 'Owner portal', mobile = false, onNavigate }) {
  const { user, role, ownerStatus, logout } = useAuth();
  const navigate = useNavigate();
  const ownerName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Vehicle owner';

  return (
    <aside
      className={`${mobile ? 'h-full w-80' : 'sticky top-16 hidden h-[calc(100vh-64px)] w-72 shrink-0 lg:block'} border-r border-white/10 bg-slate-950/55 px-4 py-5 backdrop-blur-xl`}
      aria-label="Owner navigation"
    >
      <div className="rounded-2xl border border-cyan-300/15 bg-white/[0.07] p-4 shadow-2xl shadow-cyan-950/20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">{title}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            {getInitials(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{ownerName}</p>
            <p className="truncate text-xs text-slate-300">{user?.email || 'Verified partner'}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-300/25 bg-blue-400/10 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
            <BadgeCheck className="h-3.5 w-3.5" />
            Vehicle Owner
          </span>
          <RoleBadge role={role} ownerStatus={ownerStatus} />
        </div>
      </div>

      <nav className="mt-5 space-y-1.5">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
                isActive
                  ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-50 shadow-lg shadow-cyan-950/25'
                  : 'border-transparent text-slate-300 hover:translate-x-1 hover:border-white/10 hover:bg-white/[0.07] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`grid h-8 w-8 place-items-center rounded-xl transition ${isActive ? 'bg-cyan-300 text-slate-950' : 'bg-white/5 text-cyan-200 group-hover:bg-white/10'}`}>
                  <IconResolver name={item.icon} className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.label}</span>
                <ChevronRight className={`h-4 w-4 transition ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70'}`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-slate-200 outline-none transition hover:border-rose-300/35 hover:bg-rose-500/10 hover:text-rose-100 focus-visible:ring-2 focus-visible:ring-rose-300/70"
      >
        <LogOut className="h-4 w-4" />
        Dang xuat
      </button>
    </aside>
  );
}
