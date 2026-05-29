import React from 'react';
import { Outlet } from 'react-router-dom';
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
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}

