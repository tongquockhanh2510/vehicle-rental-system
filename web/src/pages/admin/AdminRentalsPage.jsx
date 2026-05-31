import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import RentalBillModal from '../../components/common/RentalBillModal';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { compactId, formatCurrency, formatDate } from '../../utils/formatters';
import { getRentalBillPayload } from '../../utils/rentalBill';
import { getAdminRentalsData } from '../../services/adminDataService';

export default function AdminRentalsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState('');
  const [selectedBillRental, setSelectedBillRental] = useState(null);

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
      <SectionHeader
        title="Quản trị • Yêu cầu thuê"
        subtitle="Theo dõi toàn bộ rental request và bill snapshot giữa người thuê - chủ xe - phương tiện."
      />

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
          { key: '_id', title: 'Mã yêu cầu', render: (row) => `#${compactId(row._id)}` },
          {
            key: 'vehicle',
            title: 'Xe',
            render: (row) => {
              const bill = getRentalBillPayload(row);
              return `${bill?.vehicle?.brand || 'Xe'} ${bill?.vehicle?.model || ''}`.trim();
            }
          },
          {
            key: 'renter',
            title: 'Người thuê',
            render: (row) => {
              const bill = getRentalBillPayload(row);
              return bill?.renter?.name || `#${compactId(row.renter_id)}`;
            }
          },
          {
            key: 'owner',
            title: 'Chủ xe',
            render: (row) => {
              const bill = getRentalBillPayload(row);
              return bill?.owner?.name || `#${compactId(row.owner_id)}`;
            }
          },
          { key: 'start', title: 'Bắt đầu', render: (row) => formatDate(row.rental_start_date) },
          { key: 'end', title: 'Kết thúc', render: (row) => formatDate(row.rental_end_date) },
          {
            key: 'total',
            title: 'Tổng tiền',
            render: (row) => {
              const bill = getRentalBillPayload(row);
              return formatCurrency(bill?.pricing?.total_amount || 0);
            }
          },
          {
            key: 'platform_fee',
            title: 'Phí 4%',
            render: (row) => {
              const bill = getRentalBillPayload(row);
              return formatCurrency(bill?.pricing?.platform_fee || 0);
            }
          },
          { key: 'status', title: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'actions',
            title: 'Chi tiết',
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedBillRental(row)}
                className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Xem bill
              </button>
            )
          }
        ]}
      />

      <RentalBillModal
        open={Boolean(selectedBillRental)}
        onClose={() => setSelectedBillRental(null)}
        title={`Bill yêu cầu #${compactId(selectedBillRental?._id)}`}
        bill={selectedBillRental ? getRentalBillPayload(selectedBillRental) : null}
        showRenter
      />
    </div>
  );
}

