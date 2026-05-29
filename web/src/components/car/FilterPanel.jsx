import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const defaultTypes = ['CAR', 'SUV', 'PICKUP', 'VAN', 'MOTORBIKE'];
const defaultFuel = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
const defaultTransmission = ['AUTOMATIC', 'MANUAL'];

export default function FilterPanel({ filters, onChange, onReset, onSubmit }) {
  const setField = (field, value) => onChange((prev) => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
          <p className="text-sm font-semibold">Bộ lọc xe</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-cyan-300 transition hover:text-cyan-200"
        >
          Đặt lại
        </button>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-slate-300">Tìm kiếm</span>
          <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/50 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.q || ''}
              onChange={(event) => setField('q', event.target.value)}
              placeholder="Hãng xe, mẫu xe, biển số"
              className="w-full bg-transparent px-2 py-2 text-sm text-white outline-none"
            />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Loại xe</span>
            <select
              value={filters.vehicle_type || ''}
              onChange={(event) => setField('vehicle_type', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Tất cả</option>
              {defaultTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Nhiên liệu</span>
            <select
              value={filters.fuel_type || ''}
              onChange={(event) => setField('fuel_type', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Tất cả</option>
              {defaultFuel.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Hộp số</span>
            <select
              value={filters.transmission || ''}
              onChange={(event) => setField('transmission', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Tất cả</option>
              {defaultTransmission.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Số chỗ ngồi</span>
            <input
              type="number"
              min="1"
              value={filters.min_seats || ''}
              onChange={(event) => setField('min_seats', event.target.value)}
              placeholder="Tối thiểu"
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Giá thấp nhất</span>
            <input
              type="number"
              value={filters.min_price || ''}
              onChange={(event) => setField('min_price', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Giá cao nhất</span>
            <input
              type="number"
              value={filters.max_price || ''}
              onChange={(event) => setField('max_price', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] hover:bg-cyan-400"
      >
        Áp dụng bộ lọc
      </button>
    </form>
  );
}
