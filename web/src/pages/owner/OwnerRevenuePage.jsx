import React, { useEffect, useMemo, useState } from 'react';
import { Wallet2 } from 'lucide-react';
import { paymentApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, pickArray } from '../../utils/formatters';

export default function OwnerRevenuePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await paymentApi.getOwnerPayments();
        setPayments(pickArray(response.data));
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const completed = payments.filter((item) => String(item.status || '').toUpperCase() === 'COMPLETED');
    const completedAmount = completed.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pending = payments.filter((item) => String(item.status || '').toUpperCase() === 'PENDING');

    return {
      total,
      completedAmount,
      pendingAmount: pending.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      completedCount: completed.length,
      pendingCount: pending.length
    };
  }, [payments]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Owner Revenue"
        subtitle="Theo dõi doanh thu thuê xe, khoản cọc và tình trạng settlement cho từng hợp đồng."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Wallet2}
          title="No revenue data"
          description="Doanh thu sẽ cập nhật khi có giao dịch hoàn tất trên các hợp đồng đang hoạt động."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Gross payment" value={formatCurrency(stats.total)} subtitle="All owner transactions" />
            <StatCard title="Settled revenue" value={formatCurrency(stats.completedAmount)} subtitle={`${stats.completedCount} completed`} />
            <StatCard title="Pending settlement" value={formatCurrency(stats.pendingAmount)} subtitle={`${stats.pendingCount} pending`} />
            <StatCard title="System fee estimate" value={formatCurrency(stats.completedAmount * 0.04)} subtitle="4% platform fee" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Recent transactions</h3>
            <div className="space-y-2">
              {payments.slice(0, 12).map((payment) => (
                <div key={payment._id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{payment.payment_type || 'PAYMENT'} • {formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(payment.created_at)}</p>
                    </div>
                    <StatusBadge status={payment.status || 'PENDING'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
