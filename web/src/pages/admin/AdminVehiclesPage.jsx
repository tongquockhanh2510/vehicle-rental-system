import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { getAdminVehiclesData } from '../../services/adminDataService';
import { getVehicleTypeLabel } from '../../constants/vehicle';

export default function AdminVehiclesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const payload = await getAdminVehiclesData();
      setRows(payload.rows);
      setFallback(Boolean(payload.fallback));
      setError(payload.error || '');
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Quản trị • Phương tiện" subtitle="Giám sát đội xe, trạng thái vận hành và phạm vi hoạt động theo khu vực triển khai." />

      {fallback ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          API phương tiện chưa phản hồi đầy đủ, đang dùng dữ liệu dự phòng để không gián đoạn dashboard.
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
          { key: '_id', title: 'Mã xe', render: (row) => `#${String(row._id || '').slice(-8)}` },
          { key: 'name', title: 'Phương tiện', render: (row) => `${row.brand || ''} ${row.model || ''}`.trim() || 'Chưa cập nhật' },
          { key: 'type', title: 'Loại', render: (row) => getVehicleTypeLabel(row.vehicle_type) },
          { key: 'owner', title: 'Chủ xe', render: (row) => String(row.owner_id || '').slice(-8) || 'Chưa cập nhật' },
          { key: 'location', title: 'Khu vực', render: (row) => row.allowed_region || 'Chưa cập nhật' },
          { key: 'price', title: 'Giá/ngày', render: (row) => formatCurrency(row.daily_rate || 0) },
          {
            key: 'status',
            title: 'Trạng thái',
            render: (row) => <StatusBadge status={String(row.status || (row.is_available ? 'AVAILABLE' : 'PENDING')).toUpperCase()} />
          }
        ]}
      />
    </div>
  );
}
