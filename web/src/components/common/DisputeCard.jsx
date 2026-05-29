import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import StatusBadge from './StatusBadge';

export default function DisputeCard({ dispute, action }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Contract #{String(dispute.contract_id || '').slice(-6)}</p>
        <StatusBadge status={dispute.status} />
      </div>
      <p className="mt-2 text-sm text-slate-300">{dispute.description || 'No description provided.'}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
        <span className="rounded-lg border border-white/10 px-2 py-1">Claimed: {formatCurrency(dispute.claimed_amount || 0)}</span>
        <span className="rounded-lg border border-white/10 px-2 py-1">Created: {formatDateTime(dispute.created_at)}</span>
        {dispute.admin_decision_amount ? (
          <span className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
            Compensation: {formatCurrency(dispute.admin_decision_amount)}
          </span>
        ) : null}
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
