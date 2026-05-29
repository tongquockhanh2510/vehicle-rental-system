import apiClient from '../client';

export const authApi = {
  login(payload) {
    return apiClient.post('/api/users/login', payload);
  },
  register(payload) {
    return apiClient.post('/api/users/register', payload);
  },
  getProfile() {
    return apiClient.get('/api/users/profile');
  },
  updateProfile(payload) {
    return apiClient.put('/api/users/profile', payload);
  }
};
