import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { compactId, formatCurrency, formatDateTime, pickArray } from '../../utils/formatters';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await paymentApi.getRenterPayments();
      setPayments(pickArray(response.data));
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      key: 'id',
      title: 'Mã thanh toán',
      render: (row) => <span className="font-medium text-white">#{compactId(row._id)}</span>
    },
    {
      key: 'type',
      title: 'Loại',
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
        title="Thanh toán của tôi"
        subtitle="Theo dõi tiền cọc, phí thuê và hoàn tiền cho các hợp đồng thuê xe của bạn."
      />

      {!loading && payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Chưa có giao dịch thanh toán"
          description="Các giao dịch sẽ hiển thị khi hợp đồng thuê xe của bạn được kích hoạt."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={payments}
          loading={loading}
          emptyTitle="Chưa có lịch sử thanh toán"
          emptyDescription="Chưa có giao dịch nào."
        />
      )}
    </div>
  );
}
