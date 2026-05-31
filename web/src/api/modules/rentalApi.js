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
    return apiClient.get('/api/admin/rentals', { params });
  },
  createRequest(payload) {
    return apiClient.post('/api/rentals/request', payload);
  },
  checkAvailability(payload) {
    return apiClient.post('/api/rentals/check-availability', payload);
  },
  approve(rentalId) {
    return apiClient.patch(`/api/rentals/${rentalId}/approve`);
  },
  reject(rentalId) {
    return apiClient.patch(`/api/rentals/${rentalId}/reject`);
  },
  cancel(rentalId) {
    return apiClient.patch(`/api/rentals/${rentalId}/cancel`);
  },
  confirmPickup(rentalId) {
    return apiClient.patch(`/api/rentals/${rentalId}/confirm-pickup`);
  },
  returnVehicle(rentalId) {
    return apiClient.patch(`/api/rentals/${rentalId}/return`);
  },
  confirmReturn(rentalId) {
    return apiClient.patch(`/api/rentals/${rentalId}/confirm-return`);
  },
  dispute(rentalId, reason) {
    return apiClient.patch(`/api/rentals/${rentalId}/dispute`, { reason });
  },

  // Backward-compat helpers for existing screens
  confirm(rentalId) {
    return this.approve(rentalId);
  }
};
