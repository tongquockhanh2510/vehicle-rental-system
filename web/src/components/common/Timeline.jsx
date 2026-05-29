import React from 'react';
import StatusBadge from './StatusBadge';

export default function Timeline({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={`${item.title}-${idx}`} className="relative pl-8">
          <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-cyan-300" />
          {idx < items.length - 1 ? (
            <span className="absolute left-[5px] top-5 h-[calc(100%+10px)] w-px bg-cyan-400/30" />
          ) : null}
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              {item.status ? <StatusBadge status={item.status} /> : null}
            </div>
            {item.description ? <p className="mt-1 text-xs text-slate-300">{item.description}</p> : null}
            {item.timestamp ? <p className="mt-2 text-[11px] text-slate-400">{item.timestamp}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
