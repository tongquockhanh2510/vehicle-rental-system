import React from 'react';
import { Bell, CreditCard, FileText, Locate, Scale, CarFront } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

const iconMap = {
  rental: CarFront,
  contract: FileText,
  payment: CreditCard,
  tracking: Locate,
  dispute: Scale,
  system: Bell
};

export default function NotificationItem({ notification, onRead }) {
  const type = String(notification.type || notification.notification_type || 'system').toLowerCase();
  const Icon = iconMap[type] || Bell;

  return (
    <button
      type="button"
      onClick={() => !notification.is_read && onRead?.(notification._id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        notification.is_read
          ? 'border-white/10 bg-slate-900/50 hover:border-white/20'
          : 'border-cyan-400/40 bg-cyan-500/10 hover:border-cyan-300/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/15 bg-white/5 p-2">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">{notification.title || 'Notification'}</p>
            <span className="text-xs text-slate-400">{formatDateTime(notification.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
        </div>
      </div>
    </button>
  );
}
