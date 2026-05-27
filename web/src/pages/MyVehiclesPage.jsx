import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { Loader, AlertCircle, Plus } from 'lucide-react';

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyVehicles();
  }, []);

  const loadMyVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/vehicles/owner/me/list', {
        params: { page: 1, limit: 100 }
      });
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này?')) return;
    
    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
      alert('Xe đã được xóa!');
      loadMyVehicles();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete vehicle');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Xe Của Tôi</h1>
          <Link
            to="/add-vehicle"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Thêm Xe Mới
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Bạn chưa có xe nào</p>
            <Link
              to="/add-vehicle"
              className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Thêm Xe Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
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

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-blue-600">
                      {Number(vehicle.daily_rate).toLocaleString('vi-VN')} đ/ngày
                    </p>
                    <p className={`text-sm font-semibold ${vehicle.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {vehicle.is_available ? '✓ Có sẵn' : '✗ Không có sẵn'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/edit-vehicle/${vehicle._id}`}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center text-sm font-bold"
                    >
                      Chỉnh sửa
                    </Link>
                    <button
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-bold"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
