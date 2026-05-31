import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getAdminContractsData } from '../../services/adminDataService';

export default function AdminContractsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const payload = await getAdminContractsData();
      setRows(payload.rows);
      setFallback(Boolean(payload.fallback));
      setError(payload.error || '');
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Hợp đồng" subtitle="Kiểm soát vòng đời hợp đồng, kiểm tra xe và quyết toán giữa người thuê với chủ xe." />

      {fallback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          API hợp đồng chưa đầy đủ, đang dùng dữ liệu dự phòng để giữ luồng demo end-to-end.
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
          { key: '_id', title: 'Mã hợp đồng', render: (row) => `#${String(row._id || '').slice(-8)}` },
          { key: 'vehicle', title: 'Xe', render: (row) => String(row.vehicle_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'renter', title: 'Người thuê', render: (row) => String(row.renter_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'owner', title: 'Chủ xe', render: (row) => String(row.owner_id || '').slice(-8) || 'Chưa cập nhật' },
          {
            key: 'dateRange',
            title: 'Khoảng thời gian',
            render: (row) => `${formatDate(row.rental_start_date)} - ${formatDate(row.rental_end_date)}`
          },
          { key: 'deposit', title: 'Tiền cọc', render: (row) => formatCurrency(row.deposit_amount || row.deposit || 0) },
          { key: 'amount', title: 'Tiền thuê', render: (row) => formatCurrency(row.rental_amount || 0) },
          { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> }
        ]}
      />
    </div>
  );
}
