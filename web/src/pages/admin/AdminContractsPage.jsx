import React, { useEffect, useState } from 'react';
import { contractApi } from '../../api';
import DataTable from '../../components/common/DataTable';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, pickArray } from '../../utils/formatters';

export default function AdminContractsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ownerRes, renterRes] = await Promise.allSettled([
          contractApi.getOwnerContracts(),
          contractApi.getRenterContracts()
        ]);

        const ownerRows = ownerRes.status === 'fulfilled' ? pickArray(ownerRes.value.data) : [];
        const renterRows = renterRes.status === 'fulfilled' ? pickArray(renterRes.value.data) : [];
        const all = [...ownerRows, ...renterRows];
        setRows(all);
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
      <SectionHeader title="Admin • Contracts" subtitle="Kiểm soát vòng đời hợp đồng, trạng thái inspection và settlement toàn hệ thống." />
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: '_id', title: 'Contract code', render: (row) => String(row._id).slice(-8) },
          { key: 'vehicle', title: 'Vehicle', render: (row) => String(row.vehicle_id || '').slice(-8) },
          { key: 'dateRange', title: 'Date range', render: (row) => `${formatDate(row.rental_start_date)} - ${formatDate(row.rental_end_date)}` },
          { key: 'deposit', title: 'Deposit', render: (row) => formatCurrency(row.deposit_amount || row.deposit || 0) },
          { key: 'amount', title: 'Rental amount', render: (row) => formatCurrency(row.rental_amount || 0) },
          { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> }
        ]}
      />
    </div>
  );
}
