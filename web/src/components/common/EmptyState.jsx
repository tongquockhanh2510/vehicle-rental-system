import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmptyState({
  title = 'Chưa có dữ liệu',
  description = 'Dữ liệu sẽ hiển thị tại đây khi sẵn sàng.',
  action,
  icon: Icon = Sparkles
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-10 text-center shadow-2xl backdrop-blur">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10">
        <Icon className="h-6 w-6 text-cyan-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

