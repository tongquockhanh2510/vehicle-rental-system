import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';
import { ADMIN_MENU } from '../../constants/navigationConfig';

export default function AdminLayout() {
  return (
    <AppLayout>
      <Navbar menu={ADMIN_MENU} title="Admin Control Center" />
      <div className="mx-auto flex w-full max-w-[1600px]">
        <Sidebar menu={ADMIN_MENU} title="Trung tâm điều hành quản trị" />
        <main className="min-h-[calc(100vh-64px)] flex-1 px-4 pb-16 pt-6 md:px-6 md:pt-8">
          <Outlet />
        </main>
      </div>
    </AppLayout>
  );
}

