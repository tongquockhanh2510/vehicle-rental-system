import React, { useState, useEffect } from 'react';
import { vehicleAPI, rentalAPI } from '../api';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehicleAPI.getAvailable();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Xe Cho Thuê</h1>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                {vehicle.images && vehicle.images[0] && (
                  <img
                    src={vehicle.images[0]}
                    alt={vehicle.model}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
              </div>
              <h3 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-gray-600">{vehicle.year}</p>
              <p className="text-blue-600 font-semibold text-lg mt-2">
                {vehicle.daily_rate.toLocaleString('vi-VN')} đ/ngày
              </p>
              <p className="text-sm text-gray-500">
                ⭐ {vehicle.average_rating} ({vehicle.total_rentals} lượt thuê)
              </p>
              <button className="btn btn-primary w-full mt-4">
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
