import React from 'react';
import StatusBadge from './StatusBadge';

export default function ServiceHealthCard({ service }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{service.key}</p>
        <StatusBadge status={service.status || 'PENDING'} />
      </div>
      <p className="mt-2 text-xs text-slate-300">Latency: {service.latency_ms ?? '--'} ms</p>
    </article>
  );
}
