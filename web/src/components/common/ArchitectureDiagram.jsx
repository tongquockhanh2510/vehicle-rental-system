import React from 'react';

export default function ArchitectureDiagram() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <h3 className="text-lg font-semibold text-white">Kiến trúc Microservices (Container View)</h3>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[960px] rounded-2xl border border-cyan-400/20 bg-slate-950/50 p-4">
          <div className="grid grid-cols-5 gap-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Web App (React)</div>
            <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-3 text-center text-cyan-100">API Gateway</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">User Service</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Vehicle Service</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Rental Service</div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Contract Service</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Payment Service</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Dispute Service</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Tracking Service</div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-center text-slate-200">Notification Service</div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-3 text-center text-emerald-100">MongoDB</div>
            <div className="rounded-xl border border-indigo-400/35 bg-indigo-500/10 p-3 text-center text-indigo-100">Redis Cache</div>
            <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-3 text-center text-amber-100">RabbitMQ Event Bus</div>
          </div>
        </div>
      </div>
    </div>
  );
}
