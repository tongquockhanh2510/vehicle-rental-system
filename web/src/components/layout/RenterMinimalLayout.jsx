import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';
import Navbar from '../navigation/Navbar';

const minimalMenu = [{ label: 'Trang chủ', to: '/' }];

export default function RenterMinimalLayout() {
  return (
    <AppLayout>
      <Navbar menu={minimalMenu} showOwnerAction={false} />
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 md:px-6 md:pt-8">
        <Outlet />
      </main>
    </AppLayout>
  );
}

