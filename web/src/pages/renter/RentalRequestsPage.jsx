import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, ClipboardList, MapPin } from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { compactId, formatDate, pickArray } from '../../utils/formatters';
import { resolveImage } from '../../utils/image';

export default function RentalRequestsPage() {
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await rentalApi.getRenterRequests();
      setMine(pickArray(response.data));
    } catch {
      setMine([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => mine, [mine]);

  const handleCancel = async (rentalId) => {
    try {
      await rentalApi.cancel(rentalId);
      await loadData();
    } catch {
      // Silent fallback to keep UI stable.
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Yêu cầu thuê của tôi"
        subtitle="Theo dõi trạng thái các yêu cầu thuê phương tiện bạn đã gửi."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Không có yêu cầu thuê"
          description="Bạn chưa gửi yêu cầu thuê nào. Hãy khám phá xe và tạo yêu cầu đầu tiên."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((rental) => {
            const canCancel = ['PENDING', 'CONFIRMED', 'APPROVED'].includes(String(rental.status || '').toUpperCase());

            return (
              <article key={rental._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={resolveImage(rental.images?.[0], 1)}
                      alt="Xe"
                      className="h-20 w-28 rounded-xl object-cover"
                      onError={(event) => {
                        event.currentTarget.src = resolveImage('', 2);
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">Yêu cầu #{compactId(rental._id)}</p>
                      <p className="text-xs text-slate-400">Xe: {compactId(rental.vehicle_id)}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <CalendarRange className="h-3.5 w-3.5 text-cyan-300" />
                          {formatDate(rental.rental_start_date)} - {formatDate(rental.rental_end_date)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                          {rental.pickup_location || 'Chưa xác định điểm nhận'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <StatusBadge status={rental.status} />
                    <p className="text-xs text-slate-400">Trả xe: {rental.return_location || 'Chưa xác định'}</p>
                  </div>
                </div>

                {canCancel ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCancel(rental._id)}
                      className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Hủy yêu cầu
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
