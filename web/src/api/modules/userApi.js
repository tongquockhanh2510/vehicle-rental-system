import apiClient from '../client';

export const userApi = {
  getProfile() {
    return apiClient.get('/api/users/profile');
  },
  updateProfile(payload) {
    return apiClient.put('/api/users/profile', payload);
  },
  getUsers(params = {}) {
    return apiClient.get('/api/users', { params });
  },
  getAdminUsers(params = {}) {
    return apiClient.get('/api/admin/users', { params });
  },
  getUserById(userId) {
    return apiClient.get(`/api/admin/users/${userId}`);
  },
  blockUser(userId, reason) {
    return apiClient.patch(`/api/admin/users/${userId}/block`, { reason });
  },
  unblockUser(userId) {
    return apiClient.patch(`/api/admin/users/${userId}/unblock`);
  },
  softDeleteUser(userId, reason) {
    return apiClient.delete(`/api/admin/users/${userId}`, { data: { reason } });
  }
};
