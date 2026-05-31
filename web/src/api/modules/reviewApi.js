import apiClient from '../client';

export const reviewApi = {
  create(payload) {
    return apiClient.post('/api/reviews', payload);
  },
  update(reviewId, payload) {
    return apiClient.put(`/api/reviews/${reviewId}`, payload);
  },
  remove(reviewId) {
    return apiClient.delete(`/api/reviews/${reviewId}`);
  },
  getByUser(userId) {
    return apiClient.get(`/api/reviews/user/${userId}/reviews`);
  },
  getByReviewer(userId) {
    return apiClient.get(`/api/reviews/reviewer/${userId}/reviews`);
  },
  getRating(userId) {
    return apiClient.get(`/api/reviews/user/${userId}/rating`);
  },
  getByVehicle(vehicleId) {
    return apiClient.get(`/api/reviews/vehicle/${vehicleId}/reviews`);
  }
};
