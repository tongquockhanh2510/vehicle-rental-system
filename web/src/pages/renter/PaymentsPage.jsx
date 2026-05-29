import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { compactId, formatCurrency, formatDateTime, pickArray } from '../../utils/formatters';

const tabs = [
  { key: 'renter', label: 'Thanh toán của tôi' },
  { key: 'owner', label: 'Thanh toán nhận được' }
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('renter');
  const [renterPayments, setRenterPayments] = useState([]);
  const [ownerPayments, setOwnerPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [renterRes, ownerRes] = await Promise.allSettled([
        paymentApi.getRenterPayments(),
        paymentApi.getOwnerPayments()
      ]);
      setRenterPayments(renterRes.status === 'fulfilled' ? pickArray(renterRes.value.data) : []);
      setOwnerPayments(ownerRes.status === 'fulfilled' ? pickArray(ownerRes.value.data) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => (activeTab === 'renter' ? renterPayments : ownerPayments), [activeTab, renterPayments, ownerPayments]);

  const columns = [
    {
      key: 'id',
      title: 'Payment ID',
      render: (row) => <span className="font-medium text-white">#{compactId(row._id)}</span>
    },
    {
      key: 'type',
      title: 'Type',
      render: (row) => row.payment_type || '--'
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (row) => <span className="font-semibold text-cyan-300">{formatCurrency(row.amount)}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status || 'PENDING'} />
    },
    {
      key: 'created',
      title: 'Created at',
      render: (row) => formatDateTime(row.created_at)
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Payments"
        subtitle="Theo dõi deposit, rental fee, system fee, refund và compensation theo timeline giao dịch."
      />

      <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === tab.key ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment transactions"
          description="Các giao dịch thanh toán sẽ hiển thị khi hợp đồng được kích hoạt và xử lý đặt cọc."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No payment records"
          emptyDescription="There are no transactions yet."
        />
      )}
    </div>
  );
}
