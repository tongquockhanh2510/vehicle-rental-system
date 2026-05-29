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
  notes: ''
};

function resolvePickupLocation(vehicle) {
  if (!vehicle) return 'ChÆ°a cáº­p nháº­t';

  const cityDistrict = [vehicle.city, vehicle.district].filter(Boolean).join(', ');
  return vehicle.pickup_location || cityDistrict || vehicle.allowed_region || 'ChÆ°a cáº­p nháº­t';
}

function resolveReturnLocation(vehicle) {
  if (!vehicle) return 'ChÆ°a cáº­p nháº­t';

  const cityDistrict = [vehicle.city, vehicle.district].filter(Boolean).join(', ');
  return vehicle.return_location || vehicle.pickup_location || cityDistrict || vehicle.allowed_region || 'ChÆ°a cáº­p nháº­t';
}

export default function CarDetailPage({ backTo = '/vehicles', navigateAfterRequest = '/app/requests' }) {
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
        setError(err?.response?.data?.error || 'KhÃ´ng thá»ƒ táº£i chi tiáº¿t xe.');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      loadData();
    }
  }, [vehicleId]);

  const rentalDays = useMemo(() => calculateDays(form.rental_start_date, form.rental_end_date), [form]);
  const vehicleStatus = String(vehicle?.status || '').toUpperCase() || 'PENDING';
  const isOwner = String(vehicle?.owner_id || '') === String(userId || '');
  const isAvailable = vehicle?.is_available && !['RENTED', 'MAINTENANCE'].includes(vehicleStatus);
  const pickupLocation = useMemo(() => resolvePickupLocation(vehicle), [vehicle]);
  const returnLocation = useMemo(() => resolveReturnLocation(vehicle), [vehicle]);

  const handleInput = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const submitRequest = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      pushToast({ tone: 'warning', title: 'Cáº§n Ä‘Äƒng nháº­p', message: 'Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ gá»­i yÃªu cáº§u thuÃª.' });
      navigate('/login');
      return;
    }

    if (isOwner) {
      pushToast({ tone: 'warning', title: 'Giá»›i háº¡n chá»§ xe', message: 'Báº¡n khÃ´ng thá»ƒ thuÃª xe cá»§a chÃ­nh mÃ¬nh.' });
      return;
    }

    if (rentalDays <= 0) {
      pushToast({ tone: 'warning', title: 'NgÃ y khÃ´ng há»£p lá»‡', message: 'NgÃ y tráº£ xe pháº£i sau ngÃ y nháº­n xe.' });
      return;
    }

    setSubmitting(true);
    try {
      await rentalApi.createRequest({
        vehicle_id: vehicleId,
        rental_start_date: form.rental_start_date,
        rental_end_date: form.rental_end_date,
        notes: form.notes
      });

      pushToast({
        tone: 'success',
        title: 'ÄÃ£ gá»­i yÃªu cáº§u',
        message: 'YÃªu cáº§u thuÃª xe Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n chá»§ xe.'
      });
      setForm(initialForm);
      navigate(navigateAfterRequest);
    } catch (err) {
      pushToast({ tone: 'error', title: 'Gá»­i tháº¥t báº¡i', message: err?.response?.data?.error || 'KhÃ´ng thá»ƒ gá»­i yÃªu cáº§u thuÃª.' });
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
        title="KhÃ´ng tÃ¬m tháº¥y xe"
        description={error || 'Xe báº¡n tÃ¬m khÃ´ng cÃ²n hiá»ƒn thá»‹ hoáº·c Ä‘Ã£ Ä‘Æ°á»£c gá»¡ khá»i há»‡ thá»‘ng.'}
        action={
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Quay láº¡i danh sÃ¡ch xe
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`${vehicle.brand || 'Xe'} ${vehicle.model || ''}`}
        subtitle={`${vehicle.year || '2024'} â€¢ ${vehicle.vehicle_type || 'CAR'} â€¢ ${vehicle.allowed_region || 'Viá»‡t Nam'}`}
        action={
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Quay láº¡i
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <CarGallery images={vehicle.images || []} title={`${vehicle.brand} ${vehicle.model}`} />

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">Tá»•ng quan xe</h3>
              <StatusBadge status={vehicle.is_available ? 'AVAILABLE' : vehicleStatus} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
              <p>NhiÃªn liá»‡u: <span className="font-semibold text-white">{vehicle.fuel_type || 'PETROL'}</span></p>
              <p>Há»™p sá»‘: <span className="font-semibold text-white">{vehicle.transmission || 'AUTOMATIC'}</span></p>
              <p>Sá»‘ gháº¿: <span className="font-semibold text-white">{vehicle.seats || 4}</span></p>
              <p>Biá»ƒn sá»‘: <span className="font-semibold text-white">{vehicle.license_plate || '--'}</span></p>
              <p>Tiá»n cá»c: <span className="font-semibold text-white">{formatCurrency(vehicle.deposit_amount || 0)}</span></p>
              <p>GiÃ¡ thuÃª/ngÃ y: <span className="font-semibold text-cyan-300">{formatCurrency(vehicle.daily_rate || 0)}</span></p>
              <p>ThÃ nh phá»‘: <span className="font-semibold text-white">{vehicle.city || 'ChÆ°a cáº­p nháº­t'}</span></p>
              <p>Quáº­n/Huyá»‡n: <span className="font-semibold text-white">{vehicle.district || 'ChÆ°a cáº­p nháº­t'}</span></p>
              <p className="md:col-span-2">Nháº­n xe táº¡i: <span className="font-semibold text-white">{pickupLocation}</span></p>
              <p className="md:col-span-2">Tráº£ xe táº¡i: <span className="font-semibold text-white">{returnLocation}</span></p>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-300">{vehicle.description || 'Chá»§ xe chÆ°a cung cáº¥p mÃ´ táº£.'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-white">ÄÃ¡nh giÃ¡ & nháº­n xÃ©t</h3>
            {reviews.length ? (
              <div className="mt-4 space-y-3">
                {reviews.slice(0, 4).map((review) => (
                  <div key={review._id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{review.reviewer_name || 'NgÆ°á»i dÃ¹ng Ä‘Ã£ xÃ¡c thá»±c'}</p>
                      <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3.5 w-3.5" /> {review.rating || 5}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{review.comment || 'Tráº£i nghiá»‡m thuÃª xe ráº¥t tá»‘t.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-300">ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡, hÃ£y lÃ  ngÆ°á»i Ä‘áº§u tiÃªn tráº£i nghiá»‡m xe nÃ y.</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-5">
            <h3 className="text-xl font-semibold text-white">{formatCurrency(vehicle.daily_rate || 0)} <span className="text-sm text-slate-300">/ ngÃ y</span></h3>
            <p className="mt-1 text-sm text-slate-300">Tiá»n cá»c: {formatCurrency(vehicle.deposit_amount || 0)}</p>

            <div className="mt-4 grid gap-2 text-xs text-slate-300">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan-300" />Lá»‹ch thuÃª linh hoáº¡t kÃ¨m dÃ²ng thá»i gian há»£p Ä‘á»“ng</p>
              <p className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-300" />Pháº¡m vi cho phÃ©p: {vehicle.allowed_region || 'Viá»‡t Nam'}</p>
              <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-cyan-300" />Bao gá»“m theo dÃµi vÃ  báº£o vá»‡ tranh cháº¥p</p>
              <p className="flex items-center gap-2"><UserCircle2 className="h-4 w-4 text-cyan-300" />MÃ£ chá»§ xe: {String(vehicle.owner_id || '').slice(-8) || '--'}</p>
            </div>
          </div>

          {isOwner ? (
            <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">
              Báº¡n lÃ  chá»§ xe nÃ y. HÃ£y vÃ o cá»•ng chá»§ xe Ä‘á»ƒ quáº£n lÃ½ giÃ¡, lá»‹ch kháº£ dá»¥ng vÃ  yÃªu cáº§u thuÃª.
              <button
                type="button"
                onClick={() => navigate(`/owner/vehicles/${vehicle._id}/edit`)}
                className="mt-3 block rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white"
              >
                Chá»‰nh sá»­a xe
              </button>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/65 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Gá»­i yÃªu cáº§u thuÃª</h4>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-300">
                  NgÃ y nháº­n xe
                  <input
                    type="date"
                    required
                    value={form.rental_start_date}
                    onChange={(event) => handleInput('rental_start_date', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="text-xs text-slate-300">
                  NgÃ y tráº£ xe
                  <input
                    type="date"
                    required
                    value={form.rental_end_date}
                    onChange={(event) => handleInput('rental_end_date', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-xs text-slate-300">
                <p>Nháº­n xe táº¡i: <span className="font-semibold text-white">{pickupLocation}</span></p>
                <p className="mt-1">Tráº£ xe táº¡i: <span className="font-semibold text-white">{returnLocation}</span></p>
              </div>

              <label className="block text-xs text-slate-300">
                Ghi chÃº
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
                disabled={submitting || !isAvailable}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:scale-[1.01] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {submitting ? 'Äang gá»­i...' : 'Gá»­i yÃªu cáº§u thuÃª'}
              </button>
              {!isAvailable ? <p className="text-xs text-amber-200">PhÆ°Æ¡ng tiá»‡n hiá»‡n khÃ´ng á»Ÿ tráº¡ng thÃ¡i sáºµn sÃ ng Ä‘á»ƒ nháº­n yÃªu cáº§u má»›i.</p> : null}
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
