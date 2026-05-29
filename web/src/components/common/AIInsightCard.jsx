import React from 'react';
import { Bot } from 'lucide-react';

export default function AIInsightCard({ item }) {
  return (
    <article className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
      <p className="inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-violet-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
        <Bot className="h-3.5 w-3.5" /> {item.type || 'ai'}
      </p>
      <h3 className="mt-2 text-base font-semibold text-white">{item.title}</h3>
      <p className="mt-2 text-sm text-slate-200">{item.summary}</p>
    </article>
  );
}
