import React from 'react';
import { CalendarClock, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { compactId, formatCurrency, formatDate } from '../../utils/formatters';

export default function ContractCard({ contract, action }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contract</p>
          <p className="text-sm font-semibold text-white">#{compactId(contract._id)}</p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarClock className="h-4 w-4" />
            <span>Rental period</span>
          </div>
          <p className="mt-1 font-medium text-white">
            {formatDate(contract.rental_start_date)} - {formatDate(contract.rental_end_date)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2 text-slate-300">
            <FileText className="h-4 w-4" />
            <span>Financials</span>
          </div>
          <p className="mt-1 font-medium text-white">
            Deposit {formatCurrency(contract.deposit_amount || contract.deposit || 0)}
          </p>
        </div>
      </div>

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
