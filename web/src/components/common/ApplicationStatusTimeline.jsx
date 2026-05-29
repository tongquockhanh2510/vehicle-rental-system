import React from 'react';
import StatusBadge from './StatusBadge';

export default function ApplicationStatusTimeline({ application }) {
  const timeline = Array.isArray(application?.timeline)
    ? application.timeline
    : [
        { key: 'SUBMITTED', label: 'Đã gửi hồ sơ', status: 'COMPLETED', timestamp: application?.created_at },
        { key: 'UNDER_REVIEW', label: 'Đang thẩm định', status: application?.status === 'PENDING' ? 'ACTIVE' : 'COMPLETED' },
        {
          key: 'RESULT',
          label: 'Kết quả duyệt',
          status:
            application?.status === 'APPROVED'
              ? 'APPROVED'
              : application?.status === 'REJECTED'
                ? 'REJECTED'
                : 'PENDING',
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
