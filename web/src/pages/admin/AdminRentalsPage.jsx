import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { getAdminRentalsData } from '../../services/adminDataService';

export default function AdminRentalsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const payload = await getAdminRentalsData();
      setRows(payload.rows);
      setFallback(Boolean(payload.fallback));
      setError(payload.error || '');
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Yêu cầu thuê" subtitle="Theo dõi luồng yêu cầu từ người thuê đến chủ xe để kiểm soát tỉ lệ chuyển đổi hợp đồng." />

      {fallback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          API yêu cầu thuê chưa đầy đủ, đang dùng dữ liệu dự phòng liên kết với hợp đồng/thanh toán/tranh chấp.
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
          { key: '_id', title: 'Mã yêu cầu', render: (row) => `#${String(row._id || '').slice(-8)}` },
          { key: 'vehicle_id', title: 'Xe', render: (row) => String(row.vehicle_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'renter_id', title: 'Người thuê', render: (row) => String(row.renter_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'owner_id', title: 'Chủ xe', render: (row) => String(row.owner_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'start', title: 'Bắt đầu', render: (row) => formatDate(row.rental_start_date) },
          { key: 'end', title: 'Kết thúc', render: (row) => formatDate(row.rental_end_date) },
          { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> }
        ]}
      />
    </div>
  );
}
