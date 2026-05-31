import apiClient from '../client';

export const notificationApi = {
  getMine() {
    return apiClient.get('/api/notifications/my-notifications');
  },
  getUnread() {
    return apiClient.get('/api/notifications/unread');
  },
  markRead(notificationId) {
    return apiClient.put(`/api/notifications/${notificationId}/read`);
  },
  markAllRead() {
    return apiClient.put('/api/notifications/mark-all-read');
  }
};
