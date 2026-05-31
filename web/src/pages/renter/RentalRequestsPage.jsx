import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarRange, ClipboardList, MapPin, Wallet } from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import RentalBillModal from '../../components/common/RentalBillModal';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  compactId,
  formatCurrency,
  formatDate,
  pickArray
} from '../../utils/formatters';
import { getFallbackCarImage, getVehicleMainImage } from '../../utils/image';
import {
  filterRentalsByTab,
  getRentalBillPayload,
  normalizeRentalStatus,
  RENTER_REQUEST_TABS
} from '../../utils/rentalBill';

const CANCEL_ALLOWED_STATUSES = ['PENDING', 'APPROVED'];

function getVehicleTitle(rental) {
  const bill = getRentalBillPayload(rental);
  const brand = bill?.vehicle?.brand;
  const model = bill?.vehicle?.model;
  if (brand || model) {
    return `${brand || ''} ${model || ''}`.trim();
  }
  return `Xe #${compactId(rental?.vehicle_id)}`;
}

export default function RentalRequestsPage() {
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = String(searchParams.get('tab') || 'all').toLowerCase();

  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedBillRental, setSelectedBillRental] = useState(null);

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

  useEffect(() => {
    const fromQuery = String(searchParams.get('tab') || 'all').toLowerCase();
    if (fromQuery !== activeTab) {
      setActiveTab(fromQuery);
    }
  }, [searchParams, activeTab]);

  const filteredRows = useMemo(
    () => filterRentalsByTab(mine, activeTab),
    [mine, activeTab]
  );

  const statusSummary = useMemo(() => {
    const counters = {
      total: mine.length,
      pending: 0,
      approved: 0,
      active: 0,
      returnRequested: 0,
      completed: 0
    };

    mine.forEach((item) => {
      const status = normalizeRentalStatus(item?.status);
      if (status === 'PENDING') counters.pending += 1;
      if (status === 'APPROVED') counters.approved += 1;
      if (status === 'ACTIVE') counters.active += 1;
      if (status === 'RETURN_REQUESTED') counters.returnRequested += 1;
      if (status === 'COMPLETED') counters.completed += 1;
    });

    return counters;
  }, [mine]);

  const setTab = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabKey);
      return next;
    });
  };

  const runAction = async (rentalId, actionFn, successMessage, errorFallback) => {
    setActionLoadingId(rentalId);
    try {
      await actionFn();
      pushToast({ tone: 'success', title: 'Đã cập nhật', message: successMessage });
      await loadData();
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Thao tác thất bại',
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          errorFallback
      });
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Theo dõi yêu cầu thuê"
        subtitle="Bạn có thể xem đầy đủ trạng thái thuê xe: chờ duyệt, đã duyệt, đang thuê, chờ xác nhận trả và hoàn tất."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Tổng yêu cầu</p>
          <p className="mt-1 text-lg font-semibold text-white">{statusSummary.total}</p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-amber-200">Chờ duyệt</p>
          <p className="mt-1 text-lg font-semibold text-amber-100">{statusSummary.pending}</p>
        </div>
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-blue-200">Đã duyệt</p>
          <p className="mt-1 text-lg font-semibold text-blue-100">{statusSummary.approved}</p>
        </div>
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-200">Đang thuê</p>
          <p className="mt-1 text-lg font-semibold text-cyan-100">{statusSummary.active}</p>
        </div>
        <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-orange-200">Chờ xác nhận trả</p>
          <p className="mt-1 text-lg font-semibold text-orange-100">{statusSummary.returnRequested}</p>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200">Hoàn tất</p>
          <p className="mt-1 text-lg font-semibold text-emerald-100">{statusSummary.completed}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {RENTER_REQUEST_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs transition ${
              activeTab === tab.key
                ? 'border-cyan-400/70 bg-cyan-500 text-slate-950 font-semibold shadow-[0_0_0_1px_rgba(6,182,212,0.3)]'
                : 'border-white/10 bg-slate-900/55 text-slate-200 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Bạn chưa có yêu cầu thuê nào"
          description="Hãy khám phá phương tiện và gửi yêu cầu thuê đầu tiên."
          action={
            <Link
              to="/app/explore"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Khám phá phương tiện
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredRows.map((rental) => {
            const normalizedStatus = normalizeRentalStatus(rental.status);
            const canCancel = CANCEL_ALLOWED_STATUSES.includes(normalizedStatus);
            const isActionLoading = actionLoadingId === String(rental._id || '');
            const mainImage =
              getVehicleMainImage(rental) ||
              getVehicleMainImage(rental?.vehicle_snapshot) ||
              getFallbackCarImage();
            const bill = getRentalBillPayload(rental);

            return (
              <article
                key={rental._id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={mainImage}
                      alt={getVehicleTitle(rental)}
                      className="h-20 w-28 rounded-xl object-cover"
                      onError={(event) => {
                        event.currentTarget.src = getFallbackCarImage();
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{getVehicleTitle(rental)}</p>
                      <p className="text-xs text-slate-400">
                        Mã yêu cầu #{compactId(rental._id)} • Biển số:{' '}
                        {bill?.vehicle?.license_plate || 'Chưa cập nhật'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Chủ xe: <span className="text-slate-200">{bill?.owner?.name || `#${compactId(rental.owner_id)}`}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <CalendarRange className="h-3.5 w-3.5 text-cyan-300" />
                          {formatDate(rental.rental_start_date)} - {formatDate(rental.rental_end_date)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                          Nhận: {bill?.vehicle?.pickup_location || 'Chưa xác định'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <Wallet className="h-3.5 w-3.5 text-cyan-300" />
                          Tổng: {formatCurrency(bill?.pricing?.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <StatusBadge status={normalizedStatus} />
                    <p className="text-xs text-slate-400">
                      Trả xe: {bill?.vehicle?.return_location || 'Chưa xác định'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBillRental(rental)}
                    className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Xem bill
                  </button>

                  {normalizedStatus === 'APPROVED' ? (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() =>
                        runAction(
                          rental._id,
                          () => rentalApi.confirmPickup(rental._id),
                          'Đã xác nhận nhận xe. Chuyến thuê đang hoạt động.',
                          'Không thể xác nhận nhận xe.'
                        )
                      }
                      className="rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isActionLoading ? 'Đang xử lý...' : 'Xác nhận đã nhận xe'}
                    </button>
                  ) : null}

                  {normalizedStatus === 'ACTIVE' ? (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() =>
                        runAction(
                          rental._id,
                          () => rentalApi.returnVehicle(rental._id),
                          'Đã gửi xác nhận trả xe. Vui lòng chờ chủ xe xác nhận.',
                          'Không thể gửi yêu cầu trả xe.'
                        )
                      }
                      className="rounded-xl border border-amber-300/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isActionLoading ? 'Đang xử lý...' : 'Tôi đã trả xe'}
                    </button>
                  ) : null}

                  {canCancel ? (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() =>
                        runAction(
                          rental._id,
                          () => rentalApi.cancel(rental._id),
                          'Đã hủy yêu cầu thuê xe.',
                          'Không thể hủy yêu cầu này.'
                        )
                      }
                      className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isActionLoading ? 'Đang xử lý...' : 'Hủy yêu cầu'}
                    </button>
                  ) : null}

                  {normalizedStatus === 'RETURN_REQUESTED' ? (
                    <span className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
                      Đang chờ chủ xe xác nhận đã nhận lại xe
                    </span>
                  ) : null}

                  {normalizedStatus === 'COMPLETED' ? (
                    <Link
                      to="/app/reviews"
                      className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      Đánh giá
                    </Link>
                  ) : null}

                  {normalizedStatus === 'DISPUTED' ? (
                    <Link
                      to="/app/contracts"
                      className="rounded-xl border border-orange-300/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-100 transition hover:bg-orange-500/20"
                    >
                      Xem tranh chấp
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <RentalBillModal
        open={Boolean(selectedBillRental)}
        onClose={() => setSelectedBillRental(null)}
        title={`Bill yêu cầu #${compactId(selectedBillRental?._id)}`}
        bill={selectedBillRental ? getRentalBillPayload(selectedBillRental) : null}
      />
    </div>
  );
}
