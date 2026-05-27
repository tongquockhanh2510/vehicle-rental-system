import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { DollarSign, Fuel, Calendar, AlertCircle, Loader } from 'lucide-react';
import { format } from 'date-fns';

export default function VehicleDetailPage() {
    const { vehicleId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [rentalData, setRentalData] = useState({
        rental_start_date: '',
        rental_end_date: '',
        pickup_location: '',
        return_location: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadVehicle();
    }, [vehicleId]);

    const loadVehicle = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/vehicles/${vehicleId}`);
            setVehicle(response.data);
        } catch (error) {
            console.error('Error loading vehicle:', error);
            setError('Failed to load vehicle details');
        } finally {
            setLoading(false);
        }
    };

    const handleRentalSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!user) {
            navigate('/login');
            return;
        }

        if (rentalData.rental_start_date >= rentalData.rental_end_date) {
            setError('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        try {
            setSubmitting(true);
            const startDate = new Date(rentalData.rental_start_date);
            const endDate = new Date(rentalData.rental_end_date);
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const totalPrice = totalDays * vehicle.daily_rate;

            await api.post('/api/rentals/request', {
                vehicle_id: vehicleId,
                rental_start_date: rentalData.rental_start_date,
                rental_end_date: rentalData.rental_end_date,
                pickup_location: rentalData.pickup_location,
                return_location: rentalData.return_location
            });

            alert('Yêu cầu thuê xe đã được gửi!');
            setShowRentalForm(false);
            navigate('/my-rentals');
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to submit rental request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="animate-spin" size={40} />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-600">Vehicle not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Vehicle Images */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    {vehicle.images && vehicle.images[0] ? (
                        <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-96 object-cover"
                        />
                    ) : (
                        <div className="w-full h-96 bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600">No image available</span>
                        </div>
                    )}
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            {vehicle.brand} {vehicle.model}
                        </h1>
                        <p className="text-gray-600 mb-6">{vehicle.year} • {vehicle.vehicle_type}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <DollarSign size={20} className="text-blue-600 mr-2" />
                                    <span className="text-gray-600">Giá / Ngày</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {Number(vehicle.daily_rate).toLocaleString('vi-VN')} đ
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Fuel size={20} className="text-green-600 mr-2" />
                                    <span className="text-gray-600">Nhiên liệu</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{vehicle.fuel_type}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết xe</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Loại:</span>
                                    <span className="font-semibold">{vehicle.vehicle_type}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Năm sản xuất:</span>
                                    <span className="font-semibold">{vehicle.year}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Nhiên liệu:</span>
                                    <span className="font-semibold">{vehicle.fuel_type}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Tiền cọc:</span>
                                    <span className="font-semibold">
                                        {Number(vehicle.deposit_amount).toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tình trạng:</span>
                                    <span className={`font-semibold ${vehicle.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                        {vehicle.is_available ? 'Có sẵn' : 'Không có sẵn'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {vehicle.description && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mô tả</h2>
                                <p className="text-gray-700">{vehicle.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Rental Form Sidebar */}
                    <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                        {!user ? (
                            <div className="text-center">
                                <p className="text-gray-600 mb-4">Vui lòng đăng nhập để thuê xe</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        ) : !vehicle.is_available ? (
                            <div className="text-center">
                                <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                                <p className="text-red-600 font-semibold">Xe không có sẵn</p>
                            </div>
                        ) : (
                            <>
                                {!showRentalForm ? (
                                    <button
                                        onClick={() => setShowRentalForm(true)}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold"
                                    >
                                        Gửi Yêu Cầu Thuê
                                    </button>
                                ) : (
                                    <form onSubmit={handleRentalSubmit}>
                                        <h3 className="text-xl font-bold mb-4">Chọn Ngày</h3>

                                        {error && (
                                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Ngày bắt đầu</label>
                                            <input
                                                type="datetime-local"
                                                value={rentalData.rental_start_date}
                                                onChange={(e) => setRentalData({ ...rentalData, rental_start_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Địa điểm nhận xe</label>
                                            <input
                                                type="text"
                                                value={rentalData.pickup_location}
                                                onChange={(e) => setRentalData({ ...rentalData, pickup_location: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Ngày kết thúc</label>
                                            <input
                                                type="datetime-local"
                                                value={rentalData.rental_end_date}
                                                onChange={(e) => setRentalData({ ...rentalData, rental_end_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Địa điểm trả xe</label>
                                            <input
                                                type="text"
                                                value={rentalData.return_location}
                                                onChange={(e) => setRentalData({ ...rentalData, return_location: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>


                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 mb-2"
                                        >
                                            {submitting ? 'Đang gửi...' : 'Xác nhận'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRentalForm(false)}
                                            className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                                        >
                                            Hủy
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
