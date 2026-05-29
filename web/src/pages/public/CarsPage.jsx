import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { vehicleApi } from '../../api';
import CarCard from '../../components/car/CarCard';
import FilterPanel from '../../components/car/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import { VEHICLE_TYPE_OPTIONS } from '../../constants/vehicle';
import { mapMockVehicle, MOCK_VEHICLES } from '../../data/mockVehicles';
import { pickArray } from '../../utils/formatters';

const defaultFilters = {
  q: '',
  location: '',
  vehicle_type: '',
  fuel_type: '',
  transmission: '',
  min_seats: '',
  min_price: '',
  max_price: '',
  start_date: '',
  end_date: '',
  rating: '',
  driver_mode: '',
  status: ''
};

function normalizeVehicleType(value) {
  const key = String(value || '').toUpperCase();
  if (key === '7_SEAT_CAR') return 'SEVEN_SEAT_CAR';
  return key;
}

function applyClientFilters(items, filters) {
  const q = String(filters.q || '').trim().toLowerCase();
  const location = String(filters.location || '').trim().toLowerCase();
  const vehicleType = normalizeVehicleType(filters.vehicle_type);
  const minSeats = Number(filters.min_seats || 0);
  const minPrice = Number(filters.min_price || 0);
  const maxPrice = Number(filters.max_price || 0);
  const minRating = Number(filters.rating || 0);
  const status = String(filters.status || '').toUpperCase();
  const fuel = String(filters.fuel_type || '').toUpperCase();
  const transmission = String(filters.transmission || '').toUpperCase();

  return items.filter((vehicle) => {
    const haystack = `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.license_plate || ''}`.toLowerCase();
    const vehicleLocation = String(vehicle.allowed_region || '').toLowerCase();
    const type = normalizeVehicleType(vehicle.vehicle_type);
    const vehicleStatus = String(vehicle.status || (vehicle.is_available ? 'AVAILABLE' : 'PENDING')).toUpperCase();
    const rate = Number(vehicle.daily_rate || 0);
    const seats = Number(vehicle.seats || 0);
    const rating = Number(vehicle.rating || 0);

    if (q && !haystack.includes(q)) return false;
    if (location && !vehicleLocation.includes(location)) return false;
    if (vehicleType && type !== vehicleType) return false;
    if (fuel && String(vehicle.fuel_type || '').toUpperCase() !== fuel) return false;
    if (transmission && String(vehicle.transmission || '').toUpperCase() !== transmission) return false;
    if (status && vehicleStatus !== status) return false;
    if (minSeats && seats < minSeats) return false;
    if (minPrice && rate < minPrice) return false;
    if (maxPrice && rate > maxPrice) return false;
    if (minRating && rating < minRating) return false;

    if (filters.driver_mode === 'WITH_DRIVER' && type !== 'WITH_DRIVER_CAR') return false;
    if (filters.driver_mode === 'SELF_DRIVE' && type === 'WITH_DRIVER_CAR') return false;

    return true;
  });
}

export default function CarsPage({ detailBase = '/vehicles' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const incoming = { ...defaultFilters };
    Object.keys(defaultFilters).forEach((key) => {
      incoming[key] = searchParams.get(key) || '';
    });
    setFilters(incoming);
  }, [searchParams]);

  const fetchVehicles = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...nextFilters,
        page: 1,
        limit: 60,
        availability_date: nextFilters.start_date || undefined
      };
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === undefined) delete params[key];
      });

      const response = params.q
        ? await vehicleApi.getSearchList(params)
        : await vehicleApi.getAvailable(params);

      const apiRows = pickArray(response.data);
      const baseRows = apiRows.length ? apiRows : MOCK_VEHICLES.map(mapMockVehicle);
      const filtered = applyClientFilters(baseRows, nextFilters);

      setAllVehicles(baseRows);
      setVehicles(filtered);
      if (!apiRows.length) {
        setError('Hệ thống đang dùng dữ liệu demo để bạn kiểm thử luồng marketplace.');
      }
    } catch (err) {
      const fallback = MOCK_VEHICLES.map(mapMockVehicle);
      setAllVehicles(fallback);
      setVehicles(applyClientFilters(fallback, nextFilters));
      setError(err?.response?.data?.error || 'Không thể tải API, đã chuyển sang dữ liệu demo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => String(value || '').trim()).length,
    [filters]
  );

  const handleApply = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (String(value || '').trim()) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    setVehicles(applyClientFilters(allVehicles, filters));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSearchParams({});
    fetchVehicles(defaultFilters);
  };

  const onSelectCategory = (type) => {
    const nextType = normalizeVehicleType(type);
    setFilters((prev) => ({ ...prev, vehicle_type: prev.vehicle_type === nextType ? '' : nextType }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marketplace phương tiện"
        subtitle="Khám phá ô tô, xe máy, xe điện, xe đạp và nhiều loại phương tiện khác theo nhu cầu di chuyển của bạn."
      />

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Danh mục phương tiện</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VEHICLE_TYPE_OPTIONS.filter((item) => item.value !== '7_SEAT_CAR').map((item) => {
            const selected = normalizeVehicleType(filters.vehicle_type) === normalizeVehicleType(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectCategory(item.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selected ? 'bg-cyan-500 text-slate-950' : 'border border-white/15 text-slate-200 hover:bg-white/10'}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <FilterPanel filters={filters} onChange={setFilters} onReset={handleReset} onSubmit={handleApply} />

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3">
            <p className="text-sm text-slate-200">
              {loading ? 'Đang tải danh sách xe...' : `${vehicles.length} phương tiện phù hợp`}
            </p>
            <p className="text-xs text-slate-400">Bộ lọc đang áp dụng: {activeFilterCount}</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{error}</div>
          ) : null}

          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={CarFront}
              title="Không có phương tiện phù hợp với bộ lọc"
              description="Thử thay đổi bộ lọc hoặc mở rộng phạm vi giá để xem thêm lựa chọn phù hợp."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <CarCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  to={`${detailBase}/${vehicle._id}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}