import React from 'react';

export default function AppLayout({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_50%_120%,rgba(15,23,42,0.8),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative">{children}</div>
    </div>
  );
}
