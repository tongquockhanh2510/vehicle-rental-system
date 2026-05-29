import React, { useEffect, useState } from 'react';
import { rentalApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, pickArray } from '../../utils/formatters';

export default function AdminRentalsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await rentalApi.getOwnerRequests();
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
      <SectionHeader title="Admin • Rentals" subtitle="Theo dõi yêu cầu thuê mới, trạng thái xác nhận và tỉ lệ chuyển đổi thành hợp đồng." />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Rental ID', render: (row) => String(row._id).slice(-8) },
          { key: 'vehicle_id', title: 'Vehicle', render: (row) => String(row.vehicle_id).slice(-8) },
          { key: 'start', title: 'Start', render: (row) => formatDate(row.rental_start_date) },
          { key: 'end', title: 'End', render: (row) => formatDate(row.rental_end_date) },
          { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }
        ]}
      />
    </div>
  );
}
