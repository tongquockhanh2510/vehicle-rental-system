import React from 'react';

export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-xl backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
