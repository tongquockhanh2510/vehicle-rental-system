import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { DollarSign, Fuel, Loader, Search } from 'lucide-react';

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    q: '',
    vehicle_type: '',
    fuel_type: '',
    transmission: '',
    min_price: '',
    max_price: '',
    min_seats: '',
    max_seats: ''
  });

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  useEffect(() => {
    const q = filters.q.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/vehicles/search/suggestions?q=${encodeURIComponent(q)}&limit=6`);
        setSuggestions(res.data?.data || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.q]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/api/vehicles/available/list?${params.toString()}`);

      let vehicleList = [];
      if (Array.isArray(response.data)) {
        vehicleList = response.data;
      } else if (Array.isArray(response.data?.data)) {
        vehicleList = response.data.data;
      } else if (Array.isArray(response.data?.vehicles)) {
        vehicleList = response.data.vehicles;
      }

      setVehicles(vehicleList);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Khong tai duoc danh sach xe');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const applySuggestion = (value) => {
    setFilters((prev) => ({ ...prev, q: value, page: 1 }));
    setSuggestions([]);
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      q: '',
      vehicle_type: '',
      fuel_type: '',
      transmission: '',
      min_price: '',
      max_price: '',
      min_seats: '',
      max_seats: ''
    });
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Xe Cho Thue</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2">Tim kiem</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Thuong hieu, model, bien so..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded bg-white shadow">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="block w-full text-left px-3 py-2 hover:bg-blue-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <SelectField
              name="vehicle_type"
              label="Loai xe"
              value={filters.vehicle_type}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'Tat ca' },
                { value: 'CAR', label: 'Car' },
                { value: 'MOTORCYCLE', label: 'Motorcycle' },
                { value: 'VAN', label: 'Van' },
                { value: 'TRUCK', label: 'Truck' }
              ]}
            />
            <SelectField
              name="fuel_type"
              label="Nhien lieu"
              value={filters.fuel_type}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'Tat ca' },
                { value: 'PETROL', label: 'Petrol' },
                { value: 'DIESEL', label: 'Diesel' },
                { value: 'ELECTRIC', label: 'Electric' },
                { value: 'HYBRID', label: 'Hybrid' }
              ]}
            />
            <SelectField
              name="transmission"
              label="Hop so"
              value={filters.transmission}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'Tat ca' },
                { value: 'MANUAL', label: 'Manual' },
                { value: 'AUTOMATIC', label: 'Automatic' }
              ]}
            />
            <InputField
              name="min_price"
              label="Gia min"
              value={filters.min_price}
              onChange={handleFilterChange}
              placeholder="0"
              type="number"
            />
            <InputField
              name="max_price"
              label="Gia max"
              value={filters.max_price}
              onChange={handleFilterChange}
              placeholder="5000000"
              type="number"
            />
            <InputField
              name="min_seats"
              label="So cho min"
              value={filters.min_seats}
              onChange={handleFilterChange}
              placeholder="2"
              type="number"
            />
            <InputField
              name="max_seats"
              label="So cho max"
              value={filters.max_seats}
              onChange={handleFilterChange}
              placeholder="7"
              type="number"
            />
            <div className="md:col-span-3 xl:col-span-3 flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Xoa bo loc
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader className="animate-spin" size={40} />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600 text-lg">
            Khong co xe phu hop
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle._id}
                to={`/vehicles/${vehicle._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {vehicle.images && vehicle.images[0] && (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {vehicle.year} | {vehicle.vehicle_type}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <DollarSign size={16} className="mr-2 text-blue-600" />
                      <span>{Number(vehicle.daily_rate).toLocaleString('vi-VN')} VND/ngay</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Fuel size={16} className="mr-2 text-blue-600" />
                      <span>{vehicle.fuel_type || 'N/A'}</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Xem chi tiet
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({ name, label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((item) => (
          <option key={item.value || 'all'} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  );
}

function InputField({ name, label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}