import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { MapPin, DollarSign, Fuel, Loader } from 'lucide-react';

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    vehicle_type: '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);

      const response = await api.get(`/api/vehicles/available/list?${params}`);
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Xe Cho Thuê</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Loại xe</label>
              <select
                name="vehicle_type"
                value={filters.vehicle_type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="car">Ô tô</option>
                <option value="truck">Xe tải</option>
                <option value="van">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Giá tối thiểu</label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Giá tối đa</label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="999999"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, limit: 12, vehicle_type: '', min_price: '', max_price: '' })}
                className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader className="animate-spin" size={40} />
          </div>
        ) : (
          <>
            {vehicles.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 text-lg">Không có xe nào phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
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
                        {vehicle.year} • {vehicle.vehicle_type}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700">
                          <DollarSign size={16} className="mr-2 text-blue-600" />
                          <span>{Number(vehicle.daily_rate).toLocaleString('vi-VN')} đ/ngày</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Fuel size={16} className="mr-2 text-blue-600" />
                          <span>{vehicle.fuel_type}</span>
                        </div>
                      </div>

                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Xem chi tiết
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
