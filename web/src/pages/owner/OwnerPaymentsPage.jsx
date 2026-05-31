import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { compactId, formatCurrency, formatDateTime, pickArray } from '../../utils/formatters';

export default function OwnerPaymentsPage() {
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

  const columns = [
    {
      key: 'id',
      title: 'Mã giao dịch',
      render: (row) => <span className="font-medium text-white">#{compactId(row._id)}</span>
    },
    {
      key: 'type',
      title: 'Loại thanh toán',
      render: (row) => row.payment_type || '--'
    },
    {
      key: 'amount',
      title: 'Số tiền',
      render: (row) => <span className="font-semibold text-cyan-300">{formatCurrency(row.amount)}</span>
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (row) => <StatusBadge status={row.status || 'PENDING'} />
    },
    {
      key: 'created',
      title: 'Thời gian tạo',
      render: (row) => formatDateTime(row.created_at)
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Thanh toán nhận được"
        subtitle="Theo dõi dòng tiền nhận từ các hợp đồng cho thuê đã phát sinh."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Chưa có giao dịch nhận tiền"
          description="Các khoản thanh toán nhận được sẽ hiển thị khi có hợp đồng thuê hoạt động."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={payments}
          loading={loading}
          emptyTitle="Chưa có giao dịch nhận tiền"
          emptyDescription="Không có giao dịch nào."
        />
      )}
    </div>
  );
}

