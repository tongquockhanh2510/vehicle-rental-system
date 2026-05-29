import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';
import { OWNER_MENU } from '../../constants/navigationConfig';

export default function OwnerLayout() {
  return (
    <AppLayout>
      <Navbar menu={OWNER_MENU} title="CỔNG CHỦ XE" />
      <div className="mx-auto flex w-full max-w-[1400px]">
        <Sidebar menu={OWNER_MENU} title="CỔNG CHỦ XE" />
        <main className="min-h-[calc(100vh-64px)] flex-1 px-4 pb-16 pt-6 md:px-6 md:pt-8">
          <div className="mb-4 flex justify-end">
            <Link
              to="/app/explore"
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              Quay lại thuê xe
            </Link>
          </div>
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}

