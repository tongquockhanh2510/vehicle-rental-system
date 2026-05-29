import apiClient from '../client';

export const rentalApi = {
  getRenterRequests() {
    return apiClient.get('/api/rentals/renter/my-rentals');
  },
  getOwnerRequests() {
    return apiClient.get('/api/rentals/owner/my-rentals');
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
