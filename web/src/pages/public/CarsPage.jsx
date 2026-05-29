import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vehicleApi } from '../../api';
import CarCard from '../../components/car/CarCard';
import FilterPanel from '../../components/car/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SectionHeader from '../../components/common/SectionHeader';
import { CarFront } from 'lucide-react';
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
  availability_date: '',
  rating: ''
};

export default function CarsPage({ detailBase = '/cars' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);
  const [vehicles, setVehicles] = useState([]);
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
        limit: 24
      };
      Object.keys(params).forEach((key) => {
        if (params[key] === '') delete params[key];
      });

      const response = params.q
        ? await vehicleApi.getSearchList(params)
        : await vehicleApi.getAvailable(params);

      setVehicles(pickArray(response.data));
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to load vehicles.');
      setVehicles([]);
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
    fetchVehicles(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSearchParams({});
    fetchVehicles(defaultFilters);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vehicle Marketplace"
        subtitle="Khám phá xe chất lượng cao cho mọi nhu cầu: công tác, gia đình, du lịch đường dài."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <FilterPanel filters={filters} onChange={setFilters} onReset={handleReset} onSubmit={handleApply} />

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3">
            <p className="text-sm text-slate-200">
              {loading ? 'Loading vehicles...' : `${vehicles.length} vehicles found`}
            </p>
            <p className="text-xs text-slate-400">Active filters: {activeFilterCount}</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
          ) : null}

          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={CarFront}
              title="No vehicles match your filters"
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
