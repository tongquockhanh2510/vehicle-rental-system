import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../api';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import NotificationItem from '../../components/common/NotificationItem';
import SectionHeader from '../../components/common/SectionHeader';
import { useToast } from '../../context/ToastContext';
import { pickArray } from '../../utils/formatters';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getMine();
      setNotifications(pickArray(response.data));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markRead(notificationId);
      loadData();
    } catch {
      pushToast({ tone: 'error', title: 'Cập nhật thất bại', message: 'Không thể cập nhật trạng thái thông báo.' });
    }
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      pushToast({ tone: 'success', title: 'Đã đọc tất cả', message: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
      loadData();
    } catch {
      pushToast({ tone: 'error', title: 'Thao tác thất bại', message: 'Không thể đánh dấu tất cả thông báo.' });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trung tâm thông báo"
        subtitle="Theo dõi cập nhật về yêu cầu thuê, hợp đồng, thanh toán, theo dõi hành trình và tranh chấp theo thời gian thực."
        action={
          notifications.length ? (
            <button
              type="button"
              onClick={markAll}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Đánh dấu đã đọc tất cả
            </button>
          ) : null
        }
      />

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Chưa có thông báo"
          description="Khi có thay đổi từ hợp đồng, thanh toán hoặc tranh chấp, bạn sẽ thấy tại đây."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <NotificationItem key={item._id} notification={item} onRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
