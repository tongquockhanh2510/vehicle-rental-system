import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Không thể tải danh sách đặt xe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn thuê này không?')) return;
    
    try {
      await api.updateBookingStatus(id, 'cancelled');
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Chờ xác nhận', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: '⏳' },
      confirmed: { label: 'Đã xác nhận', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '✅' },
      completed: { label: 'Hoàn thành', gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: '🎉' },
      cancelled: { label: 'Đã hủy', gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', icon: '❌' }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải danh sách đặt xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white">Đơn thuê của tôi</h1>
          </div>
          <p className="text-gray-400 text-lg">Theo dõi và quản lý các đơn thuê xe của bạn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Tổng đơn', value: bookings.length, icon: '📋', color: 'from-indigo-500 to-purple-500' },
            { label: 'Chờ xác nhận', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳', color: 'from-amber-500 to-orange-500' },
            { label: 'Đã xác nhận', value: bookings.filter(b => b.status === 'confirmed').length, icon: '✅', color: 'from-emerald-500 to-teal-500' },
            { label: 'Hoàn thành', value: bookings.filter(b => b.status === 'completed').length, icon: '🎉', color: 'from-blue-500 to-indigo-500' }
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-8xl mb-6 animate-float">📭</div>
            <h3 className="text-2xl font-bold text-white mb-4">Chưa có đơn thuê nào</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Bạn chưa thuê xe nào. Hãy khám phá danh sách xe và bắt đầu hành trình của bạn!
            </p>
            <Link to="/vehicles" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Khám phá xe cho thuê
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={booking.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop'}
                        alt={booking.vehicle_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.vehicle_name}</h3>
                          <p className="text-gray-500 text-sm">Mã đơn: #{booking.id}</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                          <span>{statusConfig.icon}</span>
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Ngày nhận xe</p>
                          <p className="font-semibold text-gray-900">{new Date(booking.start_date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Ngày trả xe</p>
                          <p className="font-semibold text-gray-900">{new Date(booking.end_date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Tổng tiền</p>
                          <p className="font-bold text-indigo-600">{parseFloat(booking.total_price).toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Ngày đặt</p>
                          <p className="font-semibold text-gray-900">{new Date(booking.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {booking.status === 'pending' && (
                          <>
                            <Link
                              to={`/payment/${booking.id}`}
                              className="btn-primary text-sm"
                            >
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Thanh toán ngay
                              </span>
                            </Link>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="px-4 py-2 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-sm"
                            >
                              Hủy đơn
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-semibold text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đơn đã xác nhận - Sẵn sàng nhận xe
                          </div>
                        )}
                        {booking.status === 'completed' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Chuyến đi hoàn thành
                          </div>
                        )}
                        {booking.status === 'cancelled' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">
                            Đơn đã bị hủy
                          </div>
                        )}
                        <Link
                          to={`/vehicles/${booking.vehicle_id}`}
                          className="px-4 py-2 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm ml-auto"
                        >
                          Xem xe
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
