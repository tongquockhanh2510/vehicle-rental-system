import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { compactId, formatDate, pickArray } from '../../utils/formatters';

export default function OwnerRentalRequestsPage() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
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

  useEffect(() => {
    loadRows();
  }, []);

  const doAction = async (type, rentalId) => {
    try {
      if (type === 'approve') await rentalApi.confirm(rentalId);
      if (type === 'reject') await rentalApi.reject(rentalId);
      pushToast({ tone: 'success', title: 'Request updated', message: `Rental request has been ${type}d.` });
      loadRows();
    } catch (error) {
      pushToast({ tone: 'error', title: 'Action failed', message: error?.response?.data?.error || 'Cannot process this request.' });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Owner Rental Requests"
        subtitle="Duyệt nhanh các yêu cầu thuê đến từ renter, đồng bộ trạng thái hợp đồng downstream."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No incoming requests"
          description="Khi renter gửi yêu cầu thuê xe, dữ liệu sẽ hiển thị tại đây để bạn phê duyệt."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((rental) => {
            const pending = String(rental.status || '').toUpperCase() === 'PENDING';
            return (
              <article key={rental._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Request #{compactId(rental._id)}</p>
                    <p className="text-xs text-slate-400">Vehicle #{compactId(rental.vehicle_id)}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      {formatDate(rental.rental_start_date)} - {formatDate(rental.rental_end_date)}
                    </p>
                  </div>
                  <StatusBadge status={rental.status} />
                </div>

                {pending ? (
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => doAction('reject', rental._id)}
                      className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => doAction('approve', rental._id)}
                      className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Approve
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
