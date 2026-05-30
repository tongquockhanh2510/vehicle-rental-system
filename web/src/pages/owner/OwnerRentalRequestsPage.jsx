import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { compactId, formatDate, pickArray } from '../../utils/formatters';

function normalizeRequestStatus(status) {
  const raw = String(status || '').toUpperCase();
  if (raw === 'CONFIRMED') return 'APPROVED';
  return raw || 'PENDING';
}

export default function OwnerRentalRequestsPage() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

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

  const runAction = async (rentalId, actionFn, successMessage, errorFallback) => {
    setActionLoadingId(String(rentalId || ''));
    try {
      await actionFn();
      pushToast({ tone: 'success', title: 'Đã cập nhật yêu cầu', message: successMessage });
      await loadRows();
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
        title="Yêu cầu thuê nhận được"
        subtitle="Duyệt yêu cầu từ người thuê, xác nhận trả xe để hoàn tất chuyến và mở lại trạng thái sẵn sàng cho phương tiện."
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Chưa có yêu cầu thuê mới"
          description="Khi người thuê gửi yêu cầu thuê xe, dữ liệu sẽ hiển thị tại đây để bạn xử lý."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((rental) => {
            const normalizedStatus = normalizeRequestStatus(rental.status);
            const isActionLoading = actionLoadingId === String(rental._id || '');
            return (
              <article key={rental._id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Yêu cầu #{compactId(rental._id)}</p>
                    <p className="text-xs text-slate-300">
                      Xe: {rental.brand || 'Xe'} {rental.model || ''} • Biển số: {rental.license_plate || 'Chưa cập nhật'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Người thuê: #{compactId(rental.renter_id)} • {formatDate(rental.rental_start_date)} - {formatDate(rental.rental_end_date)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Nhận xe: {rental.pickup_location || 'Chưa cập nhật'} • Trả xe: {rental.return_location || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <StatusBadge status={normalizedStatus} />
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {normalizedStatus === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          runAction(
                            rental._id,
                            () => rentalApi.reject(rental._id),
                            'Yêu cầu thuê đã được từ chối.',
                            'Không thể từ chối yêu cầu này.'
                          )
                        }
                        className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isActionLoading ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          runAction(
                            rental._id,
                            () => rentalApi.approve(rental._id),
                            'Đã duyệt yêu cầu thuê. Xe đã chuyển sang trạng thái đang cho thuê.',
                            'Không thể duyệt yêu cầu này.'
                          )
                        }
                        className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                      >
                        {isActionLoading ? 'Đang xử lý...' : 'Duyệt'}
                      </button>
                    </>
                  ) : null}

                  {normalizedStatus === 'RETURN_REQUESTED' ? (
                    <>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          runAction(
                            rental._id,
                            () => rentalApi.dispute(rental._id, 'Chủ xe yêu cầu xử lý tranh chấp sau khi nhận xe'),
                            'Đã tạo tranh chấp cho chuyến thuê này.',
                            'Không thể tạo tranh chấp.'
                          )
                        }
                        className="rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isActionLoading ? 'Đang xử lý...' : 'Tạo tranh chấp'}
                      </button>
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          runAction(
                            rental._id,
                            () => rentalApi.confirmReturn(rental._id),
                            'Đã hoàn tất thuê xe. Phương tiện sẵn sàng cho lượt thuê tiếp theo.',
                            'Không thể xác nhận nhận lại xe.'
                          )
                        }
                        className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                      >
                        {isActionLoading ? 'Đang xử lý...' : 'Xác nhận đã nhận lại xe'}
                      </button>
                    </>
                  ) : null}

                  {normalizedStatus === 'COMPLETED' ? (
                    <>
                      <span className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                        Đã hoàn tất
                      </span>
                      <Link
                        to="/app/reviews"
                        className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                      >
                        Đánh giá người thuê
                      </Link>
                    </>
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
