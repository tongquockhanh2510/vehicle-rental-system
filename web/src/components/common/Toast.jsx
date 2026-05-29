import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const toneStyles = {
  success: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
  error: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
  warning: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
  info: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-100'
};

const toneIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info
};

export default function Toast({ toast, onClose }) {
  const Icon = toneIcons[toast.tone] || Info;

  return (
    <div className={`w-[320px] rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${toneStyles[toast.tone] || toneStyles.info}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5" />
        <div className="flex-1">
          <p className="text-sm font-semibold">{toast.title || 'Notification'}</p>
          {toast.message ? <p className="mt-1 text-xs opacity-90">{toast.message}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
