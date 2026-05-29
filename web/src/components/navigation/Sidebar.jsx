import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import IconResolver from './IconResolver';
import RoleBadge from '../common/RoleBadge';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ menu = [], title = 'Portal' }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden min-h-[calc(100vh-64px)] w-72 border-r border-white/10 bg-slate-950/70 px-4 py-5 lg:block">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <p className="mt-1 text-base font-semibold text-white">{user?.first_name || user?.email || 'User'}</p>
        <div className="mt-2">
          <RoleBadge role={role} />
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {menu.map((item) => (
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
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
