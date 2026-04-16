import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    start_date: '',
    end_date: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      const data = await api.getVehicle(id);
      setVehicle(data);
    } catch (err) {
      setError('Không thể tải thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      await api.createBooking({
        vehicle_id: parseInt(id),
        start_date: booking.start_date,
        end_date: booking.end_date
      });
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateDays = () => {
    if (!booking.start_date || !booking.end_date) return 0;
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getVehicleEmoji = (type) => {
    const emojis = { car: '🚗', motorcycle: '🏍️', bike: '🚲' };
    return emojis[type] || '🚙';
  };

  const getTypeLabel = (type) => {
    const labels = { car: 'Ô tô', motorcycle: 'Xe máy', bike: 'Xe đạp' };
    return labels[type] || type;
  };

  const getStatusConfig = (status) => {
    const configs = {
      available: { label: 'Sẵn sàng', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      booked: { label: 'Đã đặt', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      maintenance: { label: 'Bảo dưỡng', gradient: 'from-red-400 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return configs[status] || configs.available;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy xe</h2>
          <Link to="/vehicles" className="btn-primary inline-block">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(vehicle.status);
  const totalPrice = calculateDays() * vehicle.price_per_day;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minEndDate = booking.start_date || tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 animate-fade-in-up">
          <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-white transition-colors">Xe cho thuê</Link>
          <span>/</span>
          <span className="text-white">{vehicle.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Image */}
          <div className="animate-fade-in-left">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/30">
              {/* Main Image */}
              <div className={`relative aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <img
                  src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                {/* Status Badge */}
                <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} backdrop-blur-sm`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-current animate-pulse`}></span>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">{getVehicleEmoji(vehicle.type)}</span>
                  {getTypeLabel(vehicle.type)}
                </div>
              </div>

              {/* Loading Placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Vehicle Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Loại xe', value: getTypeLabel(vehicle.type), icon: '🚙' },
                { label: 'Hãng xe', value: vehicle.brand, icon: '🏭' },
                { label: 'Biển số', value: vehicle.license_plate, icon: '📋' },
                { label: 'Tình trạng', value: statusConfig.label, icon: '✅' }
              ].map((spec, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl mb-2">{spec.icon}</div>
                  <p className="text-gray-400 text-xs mb-1">{spec.label}</p>
                  <p className="text-white font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Details */}
          <div className="animate-fade-in-right">
            {/* Title & Price */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-white mb-4">{vehicle.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {vehicle.price_per_day.toLocaleString('vi-VN')}
                </span>
                <span className="text-xl text-gray-400">VNĐ / ngày</span>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Mô tả
                </h3>
                <p className="text-gray-400 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Chủ xe
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {vehicle.owner_name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <p className="text-white font-semibold">{vehicle.owner_name}</p>
                  <p className="text-gray-400 text-sm">Chủ xe tại VietRent</p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            {vehicle.status === 'available' ? (
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl border border-indigo-500/30 p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Đặt xe ngay
                </h3>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ngày nhận xe</label>
                      <input
                        type="date"
                        value={booking.start_date}
                        onChange={(e) => setBooking({ ...booking, start_date: e.target.value })}
                        className="input-field-dark"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ngày trả xe</label>
                      <input
                        type="date"
                        value={booking.end_date}
                        onChange={(e) => setBooking({ ...booking, end_date: e.target.value })}
                        className="input-field-dark"
                        min={minEndDate}
                        required
                      />
                    </div>
                  </div>

                  {calculateDays() > 0 && (
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 animate-fade-in-up">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4">Chi tiết thanh toán</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-400">
                          <span>Số ngày thuê</span>
                          <span className="text-white font-medium">{calculateDays()} ngày</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Đơn giá</span>
                          <span className="text-white font-medium">{vehicle.price_per_day.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between">
                          <span className="text-lg font-bold text-white">Tổng cộng</span>
                          <span className="text-2xl font-black text-indigo-400">
                            {totalPrice.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || calculateDays() === 0}
                    className="w-full relative overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {bookingLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Xác nhận đặt xe
                        </>
                      )}
                    </span>
                  </button>

                  {!user && (
                    <p className="text-center text-gray-400 text-sm">
                      Bạn cần{' '}
                      <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        đăng nhập
                      </Link>
                      {' '}để đặt xe
                    </p>
                  )}
                </form>
              </div>
            ) : (
              <div className="bg-red-500/10 backdrop-blur-sm rounded-3xl border border-red-500/30 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Xe hiện không khả dụng</h3>
                <p className="text-gray-400 mb-6">Xe này hiện đang được thuê hoặc đang bảo dưỡng.</p>
                <Link to="/vehicles" className="btn-primary inline-block">
                  Xem xe khác
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
