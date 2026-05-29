import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Gauge, MapPin, Star } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { resolveImage } from '../../utils/image';

export default function CarCard({ vehicle, to }) {
  const image = resolveImage(vehicle?.images?.[0], Number(vehicle?.year) || 0);
  const status = vehicle?.is_available ? 'AVAILABLE' : vehicle?.status || 'PENDING';
  const rating = Number(vehicle?.rating || 4.8).toFixed(1);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(2,6,23,0.45)] transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={`${vehicle?.brand || 'Xe'} ${vehicle?.model || ''}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = resolveImage('', Number(vehicle?.seats) || 1);
          }}
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={status} />
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-slate-950/70 px-2 py-1 text-xs text-white backdrop-blur">
          {vehicle?.vehicle_type || 'Xe'}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {vehicle?.brand || 'Premium'} {vehicle?.model || 'Xe'}
            </h3>
            <p className="text-xs text-slate-400">
              {vehicle?.year || '2024'} • {vehicle?.license_plate || 'Tin đăng cá nhân'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-cyan-300">{formatCurrency(vehicle?.daily_rate || 0)}</p>
            <p className="text-xs text-slate-400">/ ngày</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <Fuel className="h-3.5 w-3.5 text-cyan-300" />
            {vehicle?.fuel_type || 'PETROL'}
          </span>
          <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <Gauge className="h-3.5 w-3.5 text-cyan-300" />
            {vehicle?.transmission || 'AUTO'}
          </span>
          <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <MapPin className="h-3.5 w-3.5 text-cyan-300" />
            {vehicle?.allowed_region || 'Khu vực trung tâm'}
          </span>
          <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            <Star className="h-3.5 w-3.5 text-amber-300" />
            {rating}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-300">Tiền cọc: {formatCurrency(vehicle?.deposit_amount || 0)}</p>
          <Link
            to={to}
            className="rounded-xl bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-cyan-400"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
