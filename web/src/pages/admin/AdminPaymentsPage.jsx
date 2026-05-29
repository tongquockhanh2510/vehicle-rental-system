import React, { useEffect, useState } from 'react';
import { paymentApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, pickArray } from '../../utils/formatters';

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ownerRes, renterRes] = await Promise.allSettled([
          paymentApi.getOwnerPayments(),
          paymentApi.getRenterPayments()
        ]);
        const ownerRows = ownerRes.status === 'fulfilled' ? pickArray(ownerRes.value.data) : [];
        const renterRows = renterRes.status === 'fulfilled' ? pickArray(renterRes.value.data) : [];
        setRows([...ownerRows, ...renterRows]);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Thanh toán" subtitle="Giám sát giao dịch deposit/rental/refund/compensation theo trạng thái xử lý thực tế." />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Thanh toán', render: (row) => `#${String(row._id).slice(-8)}` },
          { key: 'payment_type', title: 'Loại', render: (row) => row.payment_type || '--' },
          { key: 'amount', title: 'Số tiền', render: (row) => formatCurrency(row.amount || 0) },
          { key: 'payment_method', title: 'Phương thức', render: (row) => row.payment_method || '--' },
          { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={row.status || 'PENDING'} /> },
          { key: 'created_at', title: 'Thời gian tạo', render: (row) => formatDateTime(row.created_at) }
        ]}
      />
    </div>
  );
}
