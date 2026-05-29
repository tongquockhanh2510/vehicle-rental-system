import React from 'react';
import StatusBadge from './StatusBadge';

export default function ApplicationStatusTimeline({ application }) {
  const status = String(application?.status || '').toUpperCase();

  const timeline = [
    {
      key: 'SUBMITTED',
      label: '\u0110\u00e3 g\u1eedi h\u1ed3 s\u01a1',
      status: 'COMPLETED',
      timestamp: application?.created_at
    },
    {
      key: 'UNDER_REVIEW',
      label: '\u0110ang ki\u1ec3m tra',
      status: status === 'PENDING' ? 'ACTIVE' : 'COMPLETED'
    },
    {
      key: 'WAITING_ADMIN',
      label: 'Ch\u1edd admin ph\u00ea duy\u1ec7t',
      status: status === 'PENDING' ? 'PENDING' : 'COMPLETED'
    },
    {
      key: 'RESULT',
      label: 'K\u1ebft qu\u1ea3',
      status: status === 'APPROVED' ? 'OWNER_APPROVED' : status === 'REJECTED' ? 'OWNER_REJECTED' : 'PENDING',
      timestamp: application?.updated_at
    }
  ];

  return (
    <div className="space-y-3">
      {timeline.map((item, idx) => (
        <div key={`${item.key}-${idx}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <StatusBadge status={item.status} />
            </div>
            {item.timestamp ? <p className="mt-1 text-xs text-slate-400">{new Date(item.timestamp).toLocaleString('vi-VN')}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}