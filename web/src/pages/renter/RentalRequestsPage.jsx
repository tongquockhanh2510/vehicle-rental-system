import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, ClipboardList, MapPin } from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { compactId, formatDate, pickArray } from '../../utils/formatters';
import { resolveImage } from '../../utils/image';

const tabs = [
  { key: 'mine', label: 'Yêu cầu của tôi' },
  { key: 'incoming', label: 'Yêu cầu từ người khác' }
];

export default function RentalRequestsPage() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState('mine');
  const [mine, setMine] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mineRes, incomingRes] = await Promise.allSettled([
        rentalApi.getRenterRequests(),
        rentalApi.getOwnerRequests()
      ]);

      setMine(mineRes.status === 'fulfilled' ? pickArray(mineRes.value.data) : []);
      setIncoming(incomingRes.status === 'fulfilled' ? pickArray(incomingRes.value.data) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => (activeTab === 'mine' ? mine : incoming), [activeTab, mine, incoming]);

  const doAction = async (action, rentalId) => {
    try {
      if (action === 'confirm') await rentalApi.confirm(rentalId);
      if (action === 'reject') await rentalApi.reject(rentalId);
      if (action === 'cancel') await rentalApi.cancel(rentalId);
      pushToast({ tone: 'success', title: 'Đã cập nhật', message: 'Trạng thái yêu cầu thuê đã được cập nhật.' });
      loadData();
    } catch (error) {
      pushToast({ tone: 'error', title: 'Thao tác thất bại', message: error?.response?.data?.error || 'Không thể cập nhật yêu cầu.' });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Yêu cầu thuê xe"
        subtitle="Theo dõi toàn bộ yêu cầu thuê xe và xử lý nhanh từng trạng thái PENDING/APPROVED/REJECTED."
      />

      <div className="inline-flex rounded-xl border border-white/10 bg-slate-900/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === tab.key ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Không có yêu cầu thuê"
          description="Bạn chưa có yêu cầu phù hợp trong tab hiện tại. Hãy khám phá xe hoặc chờ yêu cầu mới."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((rental) => {
            const canCancel = activeTab === 'mine' && ['PENDING', 'CONFIRMED', 'APPROVED'].includes(String(rental.status || '').toUpperCase());
            const canReview = activeTab === 'incoming' && String(rental.status || '').toUpperCase() === 'PENDING';

            return (
              <article key={rental._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={resolveImage(rental.images?.[0], 1)}
                      alt="Xe"
                      className="h-20 w-28 rounded-xl object-cover"
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

                {(canCancel || canReview) ? (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {canReview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => doAction('reject', rental._id)}
                          className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => doAction('confirm', rental._id)}
                          className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Duyệt
                        </button>
                      </>
                    ) : null}

                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => doAction('cancel', rental._id)}
                        className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                      >
                        Hủy yêu cầu
                      </button>
                    ) : null}
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
