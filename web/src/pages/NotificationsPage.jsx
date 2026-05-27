import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Loader, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/my-notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Thông Báo</h1>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg shadow-md cursor-pointer transition ${
                  notification.is_read
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`font-bold ${!notification.is_read ? 'text-blue-700' : 'text-gray-800'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-700 mt-2">{notification.message}</p>
                    {notification.action_url && (
                      <a href={notification.action_url} className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                        Xem chi tiết →
                      </a>
                    )}
                  </div>
                  {!notification.is_read && (
                    <div className="ml-4 w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {new Date(notification.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
