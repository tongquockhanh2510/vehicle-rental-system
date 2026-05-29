import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MapPinned, Shield, Star, UserCircle2 } from 'lucide-react';
import { rentalApi, reviewApi, vehicleApi } from '../../api';
import CarGallery from '../../components/car/CarGallery';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import PaymentSummary from '../../components/common/PaymentSummary';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { calculateDays, formatCurrency, pickArray } from '../../utils/formatters';

const initialForm = {
  rental_start_date: '',
  rental_end_date: '',
  pickup_location: '',
  return_location: '',
  notes: ''
};

export default function CarDetailPage({ backTo = '/cars', navigateAfterRequest = '/app/rental-requests' }) {
  const { id: routeId, vehicleId: routeVehicleId } = useParams();
  const vehicleId = routeId || routeVehicleId;
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  const { pushToast } = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const vehicleResponse = await vehicleApi.getById(vehicleId);
        const vehicleData = vehicleResponse.data;
        setVehicle(vehicleData);

        if (vehicleData?._id) {
          try {
            const reviewRes = await reviewApi.getByVehicle(vehicleData._id);
            setReviews(pickArray(reviewRes.data));
          } catch {
            setReviews([]);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.error || 'Không thể tải chi tiết xe.');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      loadData();
    }
  }, [vehicleId]);

  const rentalDays = useMemo(() => calculateDays(form.rental_start_date, form.rental_end_date), [form]);
  const isOwner = String(vehicle?.owner_id || '') === String(userId || '');

  const handleInput = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const submitRequest = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      pushToast({ tone: 'warning', title: 'Cần đăng nhập', message: 'Vui lòng đăng nhập để gửi yêu cầu thuê.' });
      navigate('/login');
      return;
    }

    if (isOwner) {
      pushToast({ tone: 'warning', title: 'Giới hạn chủ xe', message: 'Bạn không thể thuê xe của chính mình.' });
      return;
    }

    if (rentalDays <= 0) {
      pushToast({ tone: 'warning', title: 'Ngày không hợp lệ', message: 'Ngày trả xe phải sau ngày nhận xe.' });
      return;
    }

    setSubmitting(true);
    try {
      await rentalApi.createRequest({
        vehicle_id: vehicleId,
        rental_start_date: form.rental_start_date,
        rental_end_date: form.rental_end_date,
        pickup_location: form.pickup_location,
        return_location: form.return_location,
        notes: form.notes
      });

      pushToast({
        tone: 'success',
        title: 'Đã gửi yêu cầu',
        message: 'Yêu cầu thuê xe đã được gửi đến chủ xe.'
      });
      setForm(initialForm);
      navigate(navigateAfterRequest);
    } catch (err) {
      pushToast({ tone: 'error', title: 'Gửi thất bại', message: err?.response?.data?.error || 'Không thể gửi yêu cầu thuê.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (!vehicle) {
    return (
      <EmptyState
        title="Không tìm thấy xe"
        description={error || 'Xe bạn tìm không còn hiển thị hoặc đã được gỡ khỏi hệ thống.'}
        action={
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Quay lại danh sách xe
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`${vehicle.brand || 'Xe'} ${vehicle.model || ''}`}
        subtitle={`${vehicle.year || '2024'} • ${vehicle.vehicle_type || 'CAR'} • ${vehicle.allowed_region || 'Việt Nam'}`}
        action={
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Quay lại
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <CarGallery images={vehicle.images || []} title={`${vehicle.brand} ${vehicle.model}`} />

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">Tổng quan xe</h3>
              <StatusBadge status={vehicle.is_available ? 'AVAILABLE' : 'PENDING'} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
              <p>Nhiên liệu: <span className="font-semibold text-white">{vehicle.fuel_type || 'PETROL'}</span></p>
              <p>Hộp số: <span className="font-semibold text-white">{vehicle.transmission || 'AUTOMATIC'}</span></p>
              <p>Số ghế: <span className="font-semibold text-white">{vehicle.seats || 4}</span></p>
              <p>Biển số: <span className="font-semibold text-white">{vehicle.license_plate || '--'}</span></p>
              <p>Tiền cọc: <span className="font-semibold text-white">{formatCurrency(vehicle.deposit_amount || 0)}</span></p>
              <p>Giá thuê/ngày: <span className="font-semibold text-cyan-300">{formatCurrency(vehicle.daily_rate || 0)}</span></p>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-300">{vehicle.description || 'Chủ xe chưa cung cấp mô tả.'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-white">Đánh giá & nhận xét</h3>
            {reviews.length ? (
              <div className="mt-4 space-y-3">
                {reviews.slice(0, 4).map((review) => (
                  <div key={review._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{review.reviewer_name || 'Người dùng đã xác thực'}</p>
                      <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3.5 w-3.5" /> {review.rating || 5}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{review.comment || 'Trải nghiệm thuê xe rất tốt.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-300">Chưa có đánh giá, hãy là người đầu tiên trải nghiệm xe này.</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-5">
            <h3 className="text-xl font-semibold text-white">{formatCurrency(vehicle.daily_rate || 0)} <span className="text-sm text-slate-300">/ ngày</span></h3>
            <p className="mt-1 text-sm text-slate-300">Tiền cọc: {formatCurrency(vehicle.deposit_amount || 0)}</p>

            <div className="mt-4 grid gap-2 text-xs text-slate-300">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan-300" />Lịch thuê linh hoạt kèm dòng thời gian hợp đồng</p>
              <p className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-300" />Phạm vi cho phép: {vehicle.allowed_region || 'Việt Nam'}</p>
              <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-cyan-300" />Bao gồm theo dõi và bảo vệ tranh chấp</p>
              <p className="flex items-center gap-2"><UserCircle2 className="h-4 w-4 text-cyan-300" />Mã chủ xe: {String(vehicle.owner_id || '').slice(-8) || '--'}</p>
            </div>
          </div>

          {isOwner ? (
            <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
              Bạn là chủ xe này. Hãy vào cổng chủ xe để quản lý giá, lịch khả dụng và yêu cầu thuê.
              <button
                type="button"
                onClick={() => navigate('/owner/vehicles')}
                className="mt-3 block rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white"
              >
                Đi tới xe của tôi
              </button>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/65 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Gửi yêu cầu thuê</h4>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-300">
                  Ngày nhận xe
                  <input
                    type="date"
                    required
                    value={form.rental_start_date}
                    onChange={(event) => handleInput('rental_start_date', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="text-xs text-slate-300">
                  Ngày trả xe
                  <input
                    type="date"
                    required
                    value={form.rental_end_date}
                    onChange={(event) => handleInput('rental_end_date', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
              </div>

              <label className="block text-xs text-slate-300">
                Điểm nhận xe
                <input
                  type="text"
                  required
                  value={form.pickup_location}
                  onChange={(event) => handleInput('pickup_location', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              <label className="block text-xs text-slate-300">
                Điểm trả xe
                <input
                  type="text"
                  required
                  value={form.return_location}
                  onChange={(event) => handleInput('return_location', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              <label className="block text-xs text-slate-300">
                Ghi chú
                <textarea
                  value={form.notes}
                  onChange={(event) => handleInput('notes', event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              <PaymentSummary
                rentalDays={rentalDays}
                dailyRate={vehicle.daily_rate || 0}
                deposit={vehicle.deposit_amount || 0}
              />

              <button
                type="submit"
                disabled={submitting || !vehicle.is_available}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:scale-[1.01] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu thuê'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
