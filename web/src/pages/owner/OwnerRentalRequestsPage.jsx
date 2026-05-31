import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  Route,
  Timer,
  X,
  XCircle
} from 'lucide-react';
import { rentalApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { calculateDays, compactId, formatCurrency, formatDate, pickArray } from '../../utils/formatters';

function normalizeRequestStatus(status) {
  const raw = String(status || '').toUpperCase();
  if (raw === 'CONFIRMED') return 'APPROVED';
  return raw || 'PENDING';
}

const STATUS_META = {
  PENDING: {
    label: 'Pending',
    icon: Clock3,
    className: 'border-amber-300/30 bg-amber-400/15 text-amber-100'
  },
  APPROVED: {
    label: 'Approved',
    icon: Check,
    className: 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100'
  },
  ACTIVE: {
    label: 'Active',
    icon: Route,
    className: 'border-cyan-300/30 bg-cyan-400/15 text-cyan-100'
  },
  RETURN_REQUESTED: {
    label: 'Return requested',
    icon: Timer,
    className: 'border-blue-300/30 bg-blue-400/15 text-blue-100'
  },
  REJECTED: {
    label: 'Rejected',
    icon: X,
    className: 'border-rose-300/30 bg-rose-400/15 text-rose-100'
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'border-rose-300/30 bg-rose-400/15 text-rose-100'
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'border-blue-300/30 bg-blue-400/15 text-blue-100'
  },
  DISPUTED: {
    label: 'Disputed',
    icon: XCircle,
    className: 'border-orange-300/30 bg-orange-400/15 text-orange-100'
  }
};

function RequestStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function getRenterName(rental) {
  return (
    rental.renter_name ||
    rental.renter?.full_name ||
    rental.renter?.name ||
    rental.renter?.email ||
    `Renter #${compactId(rental.renter_id)}`
  );
}

function getInitials(name) {
  return String(name || 'R')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getVehicleImage(rental) {
  if (Array.isArray(rental.images) && rental.images[0]) return rental.images[0];
  if (rental.vehicle_image) return rental.vehicle_image;
  return '';
}

function getDuration(rental) {
  const explicit = Number(rental.total_days || rental.duration_days || 0);
  if (explicit > 0) return explicit;
  return Math.max(1, calculateDays(rental.rental_start_date, rental.rental_end_date));
}

function getMonthlyRevenue(rows) {
  const now = new Date();
  return rows
    .filter((item) => {
      const status = normalizeRequestStatus(item.status);
      const date = new Date(item.updated_at || item.created_at || item.rental_start_date);
      return (
        ['APPROVED', 'ACTIVE', 'RETURN_REQUESTED', 'COMPLETED'].includes(status) &&
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + Number(item.total_amount || item.rental_amount || 0), 0);
}

function getPaymentStatus(rental, status) {
  const raw = String(rental.payment_status || rental.payment?.status || '').toUpperCase();
  if (raw) return raw.replaceAll('_', ' ');
  if (status === 'COMPLETED') return 'PAID';
  if (['APPROVED', 'ACTIVE', 'RETURN_REQUESTED'].includes(status)) return 'PENDING PAYOUT';
  return 'AWAITING APPROVAL';
}

function StatTile({ title, value, icon: Icon, tone }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tone} p-4 shadow-xl shadow-slate-950/20 transition duration-200 hover:border-white/20`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{title}</p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}

function DetailLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-100">{value || 'Not updated'}</p>
      </div>
    </div>
  );
}

export default function OwnerRentalRequestsPage() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [expandedId, setExpandedId] = useState('');

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

  const stats = useMemo(() => {
    const counts = rows.reduce(
      (acc, item) => {
        const status = normalizeRequestStatus(item.status);
        if (status === 'PENDING') acc.pending += 1;
        if (status === 'APPROVED') acc.approved += 1;
        if (['ACTIVE', 'RETURN_REQUESTED'].includes(status)) acc.active += 1;
        return acc;
      },
      { pending: 0, approved: 0, active: 0 }
    );
    return { ...counts, monthlyRevenue: getMonthlyRevenue(rows) };
  }, [rows]);

  const runAction = async (rentalId, actionFn, successMessage, errorFallback) => {
    setActionLoadingId(String(rentalId || ''));
    try {
      await actionFn();
      pushToast({ tone: 'success', title: 'Request updated', message: successMessage });
      await loadRows();
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Action failed',
        message: error?.response?.data?.error || error?.response?.data?.message || errorFallback
      });
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/65 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Owner requests</p>
            <h1 className="mt-2 text-2xl font-black text-white md:text-3xl">Rental request center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Review renter demand, approve profitable trips, and keep pickup and return logistics visible in one compact workspace.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            {rows.length} total requests
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Pending Requests" value={loading ? '...' : stats.pending} icon={Clock3} tone="from-amber-500/15 to-slate-900/70" />
        <StatTile title="Approved Requests" value={loading ? '...' : stats.approved} icon={Check} tone="from-emerald-500/15 to-slate-900/70" />
        <StatTile title="Active Rentals" value={loading ? '...' : stats.active} icon={Route} tone="from-cyan-500/15 to-slate-900/70" />
        <StatTile title="Monthly Revenue" value={loading ? '...' : formatCurrency(stats.monthlyRevenue)} icon={Banknote} tone="from-blue-500/15 to-slate-900/70" />
      </section>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title="No rental requests yet"
          description="New renter requests will appear here with vehicle, route, payment, and approval actions."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((rental, index) => {
            const normalizedStatus = normalizeRequestStatus(rental.status);
            const isActionLoading = actionLoadingId === String(rental._id || '');
            const renterName = getRenterName(rental);
            const vehicleImage = getVehicleImage(rental);
            const duration = getDuration(rental);
            const isExpanded = expandedId === String(rental._id);
            const paymentStatus = getPaymentStatus(rental, normalizedStatus);

            return (
              <motion.article
                key={rental._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045, duration: 0.28 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition duration-200 hover:border-cyan-300/25 hover:bg-white/[0.075] hover:shadow-cyan-950/20"
              >
                <div className="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
                  <div className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 lg:h-full">
                    {vehicleImage ? (
                      <img src={vehicleImage} alt={`${rental.brand || 'Vehicle'} ${rental.model || ''}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-slate-800 to-slate-950 text-cyan-200">
                        <CarFront className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3">
                      <p className="text-sm font-black text-white">{rental.brand || 'Vehicle'} {rental.model || ''}</p>
                      <p className="text-xs font-semibold text-cyan-200">{rental.license_plate || 'Plate pending'}</p>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-black text-white">
                          {rental.brand || 'Vehicle'} {rental.model || ''}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">Request #{compactId(rental._id)}</p>
                      </div>
                      <RequestStatusBadge status={normalizedStatus} />
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-300 to-cyan-500 text-xs font-black text-slate-950">
                        {getInitials(renterName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Renter</p>
                        <p className="truncate text-sm font-bold text-white">{renterName}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <DetailLine icon={CalendarDays} label="Rental" value={`${formatDate(rental.rental_start_date)} -> ${formatDate(rental.rental_end_date)}`} />
                      <DetailLine icon={MapPin} label="Pickup" value={rental.pickup_location} />
                      <DetailLine icon={Route} label="Return" value={rental.return_location} />
                      <DetailLine icon={Timer} label="Duration" value={`${duration} day${duration > 1 ? 's' : ''}`} />
                      <DetailLine icon={Banknote} label="Amount" value={formatCurrency(rental.total_amount || rental.rental_amount || 0)} />
                      <DetailLine icon={CheckCircle2} label="Payment" value={paymentStatus} />
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                        <div className="mt-1 grid gap-2 rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-sm text-slate-300 md:grid-cols-3">
                          <p><span className="text-slate-500">Renter ID:</span> {compactId(rental.renter_id)}</p>
                          <p><span className="text-slate-500">Vehicle ID:</span> {compactId(rental.vehicle_id)}</p>
                          <p><span className="text-slate-500">Deposit:</span> {formatCurrency(rental.deposit_amount || 0)}</p>
                          <p className="md:col-span-3"><span className="text-slate-500">Notes:</span> {rental.notes || rental.note || 'No renter note provided.'}</p>
                        </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-row flex-wrap gap-2 lg:w-40 lg:flex-col lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? '' : String(rental._id))}
                      aria-expanded={isExpanded}
                      aria-label={`View details for request ${compactId(rental._id)}`}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-bold text-slate-100 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-300 lg:flex-none"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </button>

                    {normalizedStatus === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          aria-label={`Reject request ${compactId(rental._id)}`}
                          onClick={() =>
                            runAction(
                              rental._id,
                              () => rentalApi.reject(rental._id),
                              'The rental request has been rejected.',
                              'Unable to reject this request.'
                            )
                          }
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-100 outline-none transition hover:-translate-y-0.5 hover:bg-rose-500/20 focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
                        >
                          <X className="h-4 w-4" />
                          {isActionLoading ? 'Working...' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          aria-label={`Approve request ${compactId(rental._id)}`}
                          onClick={() =>
                            runAction(
                              rental._id,
                              () => rentalApi.approve(rental._id),
                              'Request approved. The vehicle is now marked as rented.',
                              'Unable to approve this request.'
                            )
                          }
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 outline-none transition hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 lg:flex-none"
                        >
                          <Check className="h-4 w-4" />
                          {isActionLoading ? 'Working...' : 'Approve'}
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
                              () => rentalApi.dispute(rental._id, 'Owner requested dispute handling after return'),
                              'A dispute has been opened for this rental.',
                              'Unable to create dispute.'
                            )
                          }
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-100 outline-none transition hover:bg-orange-500/20 focus-visible:ring-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
                        >
                          <XCircle className="h-4 w-4" />
                          Dispute
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() =>
                            runAction(
                              rental._id,
                              () => rentalApi.confirmReturn(rental._id),
                              'Rental completed and the vehicle is available again.',
                              'Unable to confirm vehicle return.'
                            )
                          }
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950 outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-600 lg:flex-none"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
