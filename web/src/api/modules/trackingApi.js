import apiClient from '../client';

export const trackingApi = {
  latest(vehicleId) {
    return apiClient.get(`/api/tracking/${vehicleId}/latest`);
  },
  history(vehicleId, params) {
    return apiClient.get(`/api/tracking/${vehicleId}/history`, { params });
  },
  movementHistory(vehicleId, params) {
    return apiClient.get(`/api/tracking/${vehicleId}/movement-history`, { params });
  }
};
