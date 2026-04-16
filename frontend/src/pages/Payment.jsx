import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const data = await api.getBooking(bookingId);
      setBooking(data);
    } catch (err) {
      alert('Không thể tải thông tin đơn thuê');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const newPayment = await api.createPayment({
        booking_id: parseInt(bookingId),
        amount: booking.total_price,
        method: payment.method
      });

      const result = await api.processPayment(newPayment.id);
      setPaymentResult(result);

      if (result.status === 'completed') {
        setTimeout(() => {
          navigate('/my-bookings');
        }, 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const paymentMethods = [
    { value: 'credit_card', label: 'Thẻ tín dụng', icon: '💳', desc: 'Visa, Mastercard, JCB' },
    { value: 'debit_card', label: 'Thẻ ghi nợ', icon: '💳', desc: 'ATM nội địa' },
    { value: 'momo', label: 'MoMo', icon: '📱', desc: 'Thanh toán qua ví MoMo' },
    { value: 'vnpay', label: 'VNPay', icon: '🏦', desc: 'Thanh toán qua VNPay' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy đơn thuê</h2>
          <Link to="/my-bookings" className="btn-primary inline-block">Quay lại</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link to="/my-bookings" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại đơn thuê
          </Link>
          <h1 className="text-4xl font-black text-white">Thanh toán</h1>
        </div>

        {/* Success/Error Result */}
        {paymentResult && (
          <div className={`mb-8 rounded-3xl p-8 text-center animate-scale-in ${
            paymentResult.status === 'completed' 
              ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' 
              : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              paymentResult.status === 'completed' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {paymentResult.status === 'completed' ? (
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className={`text-3xl font-black mb-4 ${paymentResult.status === 'completed' ? 'text-emerald-400' : 'text-red-400'}`}>
              {paymentResult.status === 'completed' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </h3>
            <p className="text-gray-400 mb-6">
              {paymentResult.status === 'completed' 
                ? 'Đơn thuê của bạn đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ!' 
                : paymentResult.message}
            </p>
            {paymentResult.status === 'completed' && (
              <div className="animate-pulse text-gray-400">
                Đang chuyển hướng...
              </div>
            )}
          </div>
        )}

        {!paymentResult && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-3xl p-8 shadow-lg animate-fade-in-up">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Tóm tắt đơn thuê
              </h3>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <img
                  src={booking.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop'}
                  alt={booking.vehicle_name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{booking.vehicle_name}</h4>
                  <p className="text-gray-500 text-sm">Mã đơn: #{booking.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày nhận xe</span>
                  <span className="font-medium text-gray-900">{new Date(booking.start_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày trả xe</span>
                  <span className="font-medium text-gray-900">{new Date(booking.end_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-3xl font-black text-indigo-600">
                    {parseFloat(booking.total_price).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg animate-fade-in-up delay-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                Thông tin thanh toán
              </h3>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                          payment.method === method.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={payment.method === method.value}
                          onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="font-semibold text-gray-900 text-sm">{method.label}</span>
                          <span className="text-xs text-gray-500">{method.desc}</span>
                        </div>
                        {payment.method === method.value && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Card Details (for card payments) */}
                {(payment.method === 'credit_card' || payment.method === 'debit_card') && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ</label>
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                        className="input-field"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
                        <input
                          type="text"
                          value={payment.expiry}
                          onChange={(e) => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                          className="input-field"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          className="input-field"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Demo Notice */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">Đây là phiên bản demo</p>
                      <p className="text-amber-700 text-xs mt-1">Không có khoản thanh toán thực nào được xử lý. Bạn có thể nhập bất kỳ thông tin thẻ nào.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full relative overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    {processing ? (
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Thanh toán {parseFloat(booking.total_price).toLocaleString('vi-VN')} VNĐ
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
