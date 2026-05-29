import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function PaymentSummary({ rentalDays = 0, dailyRate = 0, deposit = 0, systemFeeRate = 0.04 }) {
  const rentalAmount = rentalDays * Number(dailyRate || 0);
  const systemFee = rentalAmount * systemFeeRate;
  const total = rentalAmount + Number(deposit || 0) + systemFee;

  const rows = [
    { label: 'Rental days', value: `${rentalDays} day(s)` },
    { label: 'Rental amount', value: formatCurrency(rentalAmount) },
    { label: `System fee (${Math.round(systemFeeRate * 100)}%)`, value: formatCurrency(systemFee) },
    { label: 'Deposit', value: formatCurrency(deposit) }
  ];

  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-4">
      <p className="text-sm font-semibold text-cyan-200">Payment estimate</p>
      <div className="mt-3 space-y-2 text-sm text-slate-200">
        {rows.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span>{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-cyan-400/20 pt-3">
        <div className="flex items-center justify-between text-sm font-semibold text-white">
          <span>Total payment</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
