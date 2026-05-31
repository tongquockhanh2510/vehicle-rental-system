import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
          {trend ? <p className="mt-2 text-xs text-cyan-300">{trend}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <Icon className="h-5 w-5 text-cyan-300" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
