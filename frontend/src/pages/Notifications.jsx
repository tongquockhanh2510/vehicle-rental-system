import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Không thể tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Không thể đánh dấu đã đọc:', err);
    }
  };

  const getTypeConfig = (type) => {
    const configs = {
      booking: { icon: '📅', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      payment: { icon: '💳', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
      system: { icon: '🔔', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      default: { icon: '📬', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
    };
    return configs[type] || configs.default;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return past.toLocaleDateString('vi-VN');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center relative">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full px-1.5 animate-bounce-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Thông báo</h1>
                <p className="text-gray-400 text-sm">Cập nhật và nhắc nhở quan trọng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">📬</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{notifications.length}</div>
                <div className="text-blue-300 text-sm">Tổng thông báo</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-5 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{unreadCount}</div>
                <div className="text-amber-300 text-sm">Chưa đọc</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <span className="text-5xl opacity-50">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Không có thông báo nào</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Bạn sẽ nhận được thông báo về đơn thuê, thanh toán và các cập nhật quan trọng tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const typeConfig = getTypeConfig(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${
                    !notification.is_read 
                      ? 'bg-gradient-to-r from-white to-gray-50 shadow-lg shadow-indigo-500/10' 
                      : 'bg-white/80 shadow'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                  )}

                  <div className="p-5 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      typeConfig.bg
                    }`}>
                      <span className="text-2xl">{typeConfig.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`font-bold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {getTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!notification.is_read ? 'text-gray-600' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      {/* Actions */}
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>

                    {/* Unread Dot */}
                    {!notification.is_read && (
                      <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                    )}
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
