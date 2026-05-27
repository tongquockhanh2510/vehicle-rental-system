import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { CheckCircle, XCircle, Clock, Loader, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Safe date formatting helper
const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    let date;
    if (typeof dateValue === 'string') {
      date = parseISO(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Date format error:', error, 'Value:', dateValue);
    return 'N/A';
  }
};

export default function MyRentalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('renter'); // renter or owner

  useEffect(() => {
    loadRentals();
  }, [activeTab]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'renter' 
        ? '/api/rentals/renter/my-rentals' 
        : '/api/rentals/owner/my-rentals';
      const response = await api.get(endpoint);
      setRentals(response.data || []);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRental = async (rentalId) => {
    try {
      await api.put(`/api/rentals/${rentalId}/confirm`);
      alert('Yêu cầu thuê đã được xác nhận!');
      loadRentals();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to confirm rental');
    }
  };

  const handleRejectRental = async (rentalId) => {
    try {
      await api.put(`/api/rentals/${rentalId}/reject`);
      alert('Yêu cầu thuê đã bị từ chối!');
      loadRentals();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject rental');
    }
  };

  const handleCancelRental = async (rentalId) => {
    try {
      await api.put(`/api/rentals/${rentalId}/cancel`);
      alert('Yêu cầu thuê đã bị hủy!');
      loadRentals();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel rental');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><Clock size={16} className="mr-1" /> Chờ duyệt</span>,
      'CONFIRMED': <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><CheckCircle size={16} className="mr-1" /> Đã xác nhận</span>,
      'REJECTED': <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"><XCircle size={16} className="mr-1" /> Đã từ chối</span>,
      'CANCELLED': <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Đã hủy</span>,
    };
    return badges[status] || status;
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Yêu Cầu Thuê Xe</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('renter')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'renter'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Yêu cầu của tôi
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'owner'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Yêu cầu từ người khác
          </button>
        </div>

        {/* Rentals List */}
        {rentals.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map(rental => (
              <div key={rental._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Xe</p>
                    <p className="font-bold text-lg">{rental.vehicle_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Từ ngày</p>
                    <p className="font-semibold">{formatDate(rental.rental_start_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Đến ngày</p>
                    <p className="font-semibold">{formatDate(rental.rental_end_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Trạng thái</p>
                    <div>{getStatusBadge(rental.status)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeTab === 'owner' && rental.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleConfirmRental(rental._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-bold"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => handleRejectRental(rental._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-bold"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {activeTab === 'renter' && (rental.status === 'PENDING' || rental.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancelRental(rental._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-bold"
                      >
                        Hủy
                      </button>
                    )}
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
