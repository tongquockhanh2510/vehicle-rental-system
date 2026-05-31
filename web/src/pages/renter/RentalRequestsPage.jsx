import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, ClipboardList, MapPin, Wallet } from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { compactId, formatCurrency, formatDate, pickArray } from '../../utils/formatters';
import { getFallbackCarImage, getVehicleMainImage } from '../../utils/image';

const CANCEL_ALLOWED_STATUSES = ['PENDING', 'APPROVED', 'CONFIRMED'];

function normalizeRequestStatus(status) {
  const raw = String(status || '').toUpperCase();
  if (raw === 'CONFIRMED') return 'APPROVED';
  return raw || 'PENDING';
}

function getVehicleTitle(rental) {
  const brand = rental?.brand || rental?.vehicle?.brand;
  const model = rental?.model || rental?.vehicle?.model;
  if (brand || model) {
    return `${brand || ''} ${model || ''}`.trim();
  }
  return `Xe #${compactId(rental?.vehicle_id)}`;
}

export default function RentalRequestsPage() {
  const { pushToast } = useToast();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

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
        message: error?.response?.data?.error || error?.response?.data?.message || errorFallback
      });
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Yêu cầu thuê của tôi"
        subtitle="Theo dõi trạng thái thuê xe theo thời gian thực: duyệt yêu cầu, nhận xe, trả xe và hoàn tất chuyến đi."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : rows.length === 0 ? (
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
          {rows.map((rental) => {
            const normalizedStatus = normalizeRequestStatus(rental.status);
            const canCancel = CANCEL_ALLOWED_STATUSES.includes(normalizedStatus);
            const isActionLoading = actionLoadingId === String(rental._id || '');
            const mainImage =
              getVehicleMainImage(rental) ||
              getVehicleMainImage(rental?.vehicle) ||
              getFallbackCarImage();

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
                        Mã yêu cầu #{compactId(rental._id)} • Biển số: {rental.license_plate || 'Chưa cập nhật'}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <CalendarRange className="h-3.5 w-3.5 text-cyan-300" />
                          {formatDate(rental.rental_start_date)} - {formatDate(rental.rental_end_date)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                          Nhận: {rental.pickup_location || 'Chưa xác định điểm nhận'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                          <Wallet className="h-3.5 w-3.5 text-cyan-300" />
                          Tạm tính: {formatCurrency(rental.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <StatusBadge status={normalizedStatus} />
                    <p className="text-xs text-slate-400">Trả xe: {rental.return_location || 'Chưa xác định'}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Link
                    to="/app/contracts"
                    className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Xem hợp đồng
                  </Link>

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
    </div>
  );
}
