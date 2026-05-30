import apiClient from '../client';

export const rentalApi = {
  async getRenterRequests() {
    try {
      return await apiClient.get('/api/rentals/my-requests');
    } catch {
      return apiClient.get('/api/rentals/renter/my-rentals');
    }
  },
  async getOwnerRequests() {
    try {
      return await apiClient.get('/api/rentals/owner-requests');
    } catch {
      return apiClient.get('/api/rentals/owner/my-rentals');
    }
  },
  getAdminRentals(params = {}) {
    return apiClient.get('/api/rentals/admin/list', { params });
  },
  createRequest(payload) {
    return apiClient.post('/api/rentals/request', payload);
  },
  checkAvailability(payload) {
    return apiClient.post('/api/rentals/check-availability', payload);
  },
  confirm(rentalId) {
    return apiClient.put(`/api/rentals/${rentalId}/confirm`);
  },
  reject(rentalId) {
    return apiClient.put(`/api/rentals/${rentalId}/reject`);
  },
  cancel(rentalId) {
    return apiClient.put(`/api/rentals/${rentalId}/cancel`);
  }
};
