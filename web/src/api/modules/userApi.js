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
  }
};
