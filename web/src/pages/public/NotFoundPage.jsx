import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">404</p>
      <h1 className="mt-2 text-4xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-300">Trang bạn tìm không tồn tại hoặc đã được chuyển sang route mới.</p>
      <Link to="/" className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
        Back to home
      </Link>
    </div>
  );
}
