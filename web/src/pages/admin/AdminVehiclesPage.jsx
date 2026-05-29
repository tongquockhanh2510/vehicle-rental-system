import React, { useEffect, useState } from 'react';
import { vehicleApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, pickArray } from '../../utils/formatters';

export default function AdminVehiclesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await vehicleApi.getAvailable({ page: 1, limit: 40 });
        setRows(pickArray(response.data));
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
      <SectionHeader title="Admin • Vehicles" subtitle="Giám sát inventory xe hoạt động trên hệ thống và trạng thái listing." />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Vehicle ID', render: (row) => String(row._id).slice(-8) },
          { key: 'name', title: 'Model', render: (row) => `${row.brand || ''} ${row.model || ''}`.trim() },
          { key: 'owner', title: 'Owner', render: (row) => String(row.owner_id || '').slice(-8) },
          { key: 'price', title: 'Price/day', render: (row) => formatCurrency(row.daily_rate || 0) },
          { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.is_available ? 'AVAILABLE' : 'PENDING'} /> }
        ]}
      />
    </div>
  );
}
