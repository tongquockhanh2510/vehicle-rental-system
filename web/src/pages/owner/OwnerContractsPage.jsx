import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  MapPin,
  MessageCircle,
  Route,
  Search,
  ShieldCheck,
  Timer,
  XCircle
} from 'lucide-react';
import { contractApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { calculateDays, compactId, formatCurrency, formatDate, pickArray } from '../../utils/formatters';

const STATUS_META = {
  PENDING: { label: 'Pending', icon: Clock3, className: 'border-amber-300/30 bg-amber-400/15 text-amber-100' },
  ACTIVE: { label: 'Active', icon: Route, className: 'border-cyan-300/30 bg-cyan-400/15 text-cyan-100' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, className: 'border-blue-300/30 bg-blue-400/15 text-blue-100' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, className: 'border-rose-300/30 bg-rose-400/15 text-rose-100' },
  DISPUTED: { label: 'Disputed', icon: XCircle, className: 'border-orange-300/30 bg-orange-400/15 text-orange-100' }
};

const TIMELINE_STEPS = [
  'Booked',
  'Approved',
  'Deposit Paid',
  'Vehicle Picked Up',
  'Active Rental',
  'Vehicle Returned',
  'Completed'
];

function normalizeStatus(status) {
  return String(status || 'PENDING').toUpperCase();
}

function getVehicleName(contract) {
  return `${contract.brand || 'Vehicle'} ${contract.model || ''}`.trim();
}

function getVehicleImage(contract) {
  if (Array.isArray(contract.images) && contract.images[0]) return contract.images[0];
  return contract.vehicle_image || '';
}

function getRenterName(contract) {
  return contract.renter_name || contract.renter?.full_name || contract.renter?.name || `Renter #${compactId(contract.renter_id)}`;
}

function getInitials(name) {
  return String(name || 'R')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getDuration(contract) {
  const explicit = Number(contract.total_days || 0);
  if (explicit > 0) return explicit;
  return Math.max(1, calculateDays(contract.rental_start_date, contract.rental_end_date));
}

function getTotalAmount(contract) {
  return Number(contract.total_cost || contract.total_amount || contract.rental_cost || 0);
}

function getPaidAmount(contract) {
  return Number(contract.paid_amount || contract.amount_paid || contract.payment?.paid_amount || 0);
}

function isSameMonth(value, now = new Date()) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function getStepState(contract, step) {
  const status = normalizeStatus(contract.status);
  const paidAmount = getPaidAmount(contract);
  const depositAmount = Number(contract.deposit_amount || contract.deposit || 0);

  if (step === 'Booked') return true;
  if (step === 'Approved') return ['ACTIVE', 'COMPLETED', 'DISPUTED'].includes(status);
  if (step === 'Deposit Paid') return paidAmount >= depositAmount || ['ACTIVE', 'COMPLETED'].includes(status);
  if (step === 'Vehicle Picked Up') return Boolean(contract.pickup_time);
  if (step === 'Active Rental') return status === 'ACTIVE' || Boolean(contract.pickup_time);
  if (step === 'Vehicle Returned') return Boolean(contract.return_time) || status === 'COMPLETED';
  if (step === 'Completed') return status === 'COMPLETED';
  return false;
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const meta = STATUS_META[normalized] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function StatTile({ title, value, icon: Icon, tone }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tone} p-4 shadow-xl shadow-slate-950/20`}
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

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-2">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="truncate text-sm font-semibold text-slate-100">{value || 'Not updated'}</p>
        </div>
      </div>
    </div>
  );
}

function ContractTimeline({ contract }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-3 md:grid-cols-7">
      {TIMELINE_STEPS.map((step, index) => {
        const done = getStepState(contract, step);
        return (
          <div key={step} className="relative flex items-center gap-3 md:block">
            {index < TIMELINE_STEPS.length - 1 ? (
              <span className={`absolute left-4 top-8 h-[calc(100%+8px)] w-px md:left-[calc(50%+14px)] md:top-4 md:h-px md:w-[calc(100%-28px)] ${done ? 'bg-cyan-300/70' : 'bg-white/10'}`} />
            ) : null}
            <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-black ${done ? 'border-cyan-200 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20' : 'border-white/15 bg-slate-900 text-slate-500'}`}>
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <p className={`text-xs font-semibold md:mt-2 md:text-center ${done ? 'text-cyan-100' : 'text-slate-500'}`}>{step}</p>
          </div>
        );
      })}
    </div>
  );
}

function downloadContract(contract) {
  const html = `
    <html><head><title>Contract ${contract._id}</title></head>
    <body style="font-family: Arial, sans-serif; padding: 32px;">
      <h1>Vehicle Rental Contract</h1>
      <p><strong>Contract:</strong> ${contract._id || ''}</p>
      <p><strong>Vehicle:</strong> ${getVehicleName(contract)} - ${contract.license_plate || ''}</p>
      <p><strong>Renter:</strong> ${getRenterName(contract)}</p>
      <p><strong>Rental:</strong> ${formatDate(contract.rental_start_date)} - ${formatDate(contract.rental_end_date)}</p>
      <p><strong>Total:</strong> ${formatCurrency(getTotalAmount(contract))}</p>
      <p><strong>Status:</strong> ${normalizeStatus(contract.status)}</p>
    </body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contract-${compactId(contract._id)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', vehicle: 'ALL', date: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await contractApi.getOwnerContracts();
      setContracts(pickArray(response.data));
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const vehicleOptions = useMemo(() => {
    const map = new Map();
    contracts.forEach((item) => {
      if (item.vehicle_id) map.set(String(item.vehicle_id), getVehicleName(item));
    });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return contracts.filter((contract) => {
      const status = normalizeStatus(contract.status);
      const text = `${getVehicleName(contract)} ${contract.license_plate || ''} ${getRenterName(contract)} ${contract._id || ''}`.toLowerCase();
      if (query && !text.includes(query)) return false;
      if (filters.status !== 'ALL' && status !== filters.status) return false;
      if (filters.vehicle !== 'ALL' && String(contract.vehicle_id) !== filters.vehicle) return false;
      if (filters.date) {
        const start = String(contract.rental_start_date || '').slice(0, 10);
        const end = String(contract.rental_end_date || '').slice(0, 10);
        if (filters.date < start || filters.date > end) return false;
      }
      return true;
    });
  }, [contracts, filters]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      active: contracts.filter((item) => normalizeStatus(item.status) === 'ACTIVE').length,
      upcoming: contracts.filter((item) => {
        const date = new Date(item.rental_start_date);
        return normalizeStatus(item.status) === 'ACTIVE' && !Number.isNaN(date.getTime()) && date >= today && !item.pickup_time;
      }).length,
      completed: contracts.filter((item) => normalizeStatus(item.status) === 'COMPLETED').length,
      revenue: contracts
        .filter((item) => normalizeStatus(item.status) === 'COMPLETED' && isSameMonth(item.return_time || item.updated_at || item.created_at))
        .reduce((sum, item) => sum + getTotalAmount(item), 0)
    };
  }, [contracts]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-slate-900/65 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Owner contracts</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white md:text-3xl">Contract management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Track active rentals, pickup milestones, deposits, remaining balance, and completion status in one premium owner workspace.
            </p>
          </div>
          <StatusBadge status="ACTIVE" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Active Rentals" value={loading ? '...' : stats.active} icon={Route} tone="from-cyan-500/15 to-slate-900/70" />
        <StatTile title="Upcoming Pickups" value={loading ? '...' : stats.upcoming} icon={CalendarDays} tone="from-amber-500/15 to-slate-900/70" />
        <StatTile title="Completed Contracts" value={loading ? '...' : stats.completed} icon={CheckCircle2} tone="from-blue-500/15 to-slate-900/70" />
        <StatTile title="Monthly Revenue" value={loading ? '...' : formatCurrency(stats.revenue)} icon={Banknote} tone="from-emerald-500/15 to-slate-900/70" />
      </section>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl md:grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Search contracts, renter, vehicle..."
            aria-label="Search contracts"
            className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/45 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <select
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          aria-label="Filter by status"
          className="h-11 rounded-2xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
        >
          <option value="ALL">All statuses</option>
          {Object.keys(STATUS_META).map((status) => (
            <option key={status} value={status}>{STATUS_META[status].label}</option>
          ))}
        </select>
        <select
          value={filters.vehicle}
          onChange={(event) => setFilters((prev) => ({ ...prev, vehicle: event.target.value }))}
          aria-label="Filter by vehicle"
          className="h-11 rounded-2xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
        >
          <option value="ALL">All vehicles</option>
          {vehicleOptions.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
          aria-label="Filter by rental date"
          className="h-11 rounded-2xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
        />
      </section>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No matching contracts"
          description="Contracts appear after you approve rental requests. Adjust filters to see more records."
        />
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract, index) => {
            const renterName = getRenterName(contract);
            const total = getTotalAmount(contract);
            const deposit = Number(contract.deposit_amount || contract.deposit || 0);
            const paid = getPaidAmount(contract);
            const remaining = Math.max(0, total - paid);
            const image = getVehicleImage(contract);
            const duration = getDuration(contract);

            return (
              <motion.article
                key={contract._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.28 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition hover:border-cyan-300/25 hover:bg-white/[0.075]"
              >
                <div className="grid gap-4 xl:grid-cols-[190px_1fr]">
                  <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 xl:h-full">
                    {image ? (
                      <img src={image} alt={getVehicleName(contract)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-slate-800 to-slate-950 text-cyan-200">
                        <CarFront className="h-11 w-11" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3">
                      <p className="text-sm font-black text-white">{getVehicleName(contract)}</p>
                      <p className="text-xs font-semibold text-cyan-200">{contract.license_plate || 'Plate pending'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contract #{compactId(contract._id)}</p>
                        <h2 className="mt-1 text-xl font-black text-white">{getVehicleName(contract)}</h2>
                      </div>
                      <StatusBadge status={contract.status} />
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-3 py-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-300 to-cyan-500 text-xs font-black text-slate-950">
                          {getInitials(renterName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Renter</p>
                          <p className="truncate text-sm font-bold text-white">{renterName}</p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <InfoPill icon={CalendarDays} label="Start" value={formatDate(contract.rental_start_date)} />
                        <InfoPill icon={CalendarDays} label="End" value={formatDate(contract.rental_end_date)} />
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <InfoPill icon={Timer} label="Duration" value={`${duration} day${duration > 1 ? 's' : ''}`} />
                      <InfoPill icon={MapPin} label="Pickup" value={contract.pickup_location} />
                      <InfoPill icon={Route} label="Return" value={contract.return_location} />
                      <InfoPill icon={ShieldCheck} label="License" value={contract.license_plate} />
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <InfoPill icon={Banknote} label="Total" value={formatCurrency(total)} />
                      <InfoPill icon={Banknote} label="Deposit" value={formatCurrency(deposit)} />
                      <InfoPill icon={CheckCircle2} label="Paid" value={formatCurrency(paid)} />
                      <InfoPill icon={Clock3} label="Remaining" value={formatCurrency(remaining)} />
                    </div>

                    <ContractTimeline contract={contract} />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(contract)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-bold text-slate-100 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-300"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <a
                        href={contract.renter_email ? `mailto:${contract.renter_email}` : '#'}
                        onClick={(event) => {
                          if (!contract.renter_email) event.preventDefault();
                        }}
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 outline-none transition hover:bg-cyan-400/15 focus-visible:ring-2 focus-visible:ring-cyan-300"
                        aria-disabled={!contract.renter_email}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contact Renter
                      </a>
                      <Link
                        to="/owner/tracking"
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-100 outline-none transition hover:bg-blue-400/15 focus-visible:ring-2 focus-visible:ring-blue-300"
                      >
                        <Route className="h-4 w-4" />
                        Track Vehicle
                      </Link>
                      <button
                        type="button"
                        onClick={() => downloadContract(contract)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 outline-none transition hover:bg-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-200"
                      >
                        <Download className="h-4 w-4" />
                        Download Contract PDF
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected ? (
          <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Contract details" width="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <InfoPill icon={CarFront} label="Vehicle" value={`${getVehicleName(selected)} (${selected.license_plate || '--'})`} />
                <InfoPill icon={CalendarDays} label="Rental" value={`${formatDate(selected.rental_start_date)} - ${formatDate(selected.rental_end_date)}`} />
                <InfoPill icon={Banknote} label="Total value" value={formatCurrency(getTotalAmount(selected))} />
              </div>
              <ContractTimeline contract={selected} />
            </motion.div>
          </Modal>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
