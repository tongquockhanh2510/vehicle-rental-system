import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, SwitchCamera } from 'lucide-react';
import AppLayout from './AppLayout';
import Sidebar from '../navigation/Sidebar';
import { OWNER_MENU } from '../../constants/navigationConfig';
import { useAuth } from '../../context/AuthContext';

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Cá»•ng chá»§ xe</p>
            <p className="text-xs text-slate-400">Quáº£n lÃ½ phÆ°Æ¡ng tiá»‡n cho thuÃª vÃ  doanh thu</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/explore"
              className="inline-flex items-center gap-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              <SwitchCamera className="h-3.5 w-3.5" />
              Quay láº¡i thuÃª xe
            </Link>
            <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white md:block">
              {user?.first_name || user?.email || 'TÃ i khoáº£n'}
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              ÄÄƒng xuáº¥t
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1400px]">
        <Sidebar menu={OWNER_MENU} title="Cá»”NG CHá»¦ XE" />
        <main className="min-h-[calc(100vh-64px)] flex-1 px-4 pb-16 pt-6 md:px-6 md:pt-8">
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}
