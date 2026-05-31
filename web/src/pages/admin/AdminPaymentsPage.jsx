import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { getAdminPaymentsData } from '../../services/adminDataService';

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const payload = await getAdminPaymentsData();
      setRows(payload.rows);
      setFallback(Boolean(payload.fallback));
      setError(payload.error || '');
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Thanh toán" subtitle="Giám sát giao dịch deposit, phí thuê, hoàn tiền và bồi thường theo trạng thái xử lý thực tế." />

      {fallback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          API thanh toán chưa trả đủ dữ liệu, đang dùng dữ liệu dự phòng liên kết theo hợp đồng.
        </div>
      ) : null}

      {!loading && error ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </div>
      ) : null}

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Thanh toán', render: (row) => `#${String(row._id || '').slice(-8)}` },
          { key: 'contract_id', title: 'Hợp đồng', render: (row) => String(row.contract_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'payment_type', title: 'Loại', render: (row) => row.payment_type || 'Chưa cập nhật' },
          { key: 'amount', title: 'Số tiền', render: (row) => formatCurrency(row.amount || 0) },
          { key: 'payment_method', title: 'Phương thức', render: (row) => row.payment_method || 'Chưa cập nhật' },
          { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={row.status || 'PENDING'} /> },
          { key: 'created_at', title: 'Thời gian tạo', render: (row) => formatDateTime(row.created_at) }
        ]}
      />
    </div>
  );
}
