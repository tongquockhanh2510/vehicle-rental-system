import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';
import Navbar from '../navigation/Navbar';
import { USER_MENU } from '../../constants/menus';

export default function UserLayout() {
  return (
    <AppLayout>
      <Navbar menu={USER_MENU} title="User Portal" />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-6 md:pt-8">
        <Outlet />
      </main>
    </AppLayout>
  );
}
