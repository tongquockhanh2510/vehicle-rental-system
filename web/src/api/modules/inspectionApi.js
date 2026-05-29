import apiClient from '../client';

export const inspectionApi = {
  submitPickup(contractId, formData) {
    return apiClient.post(`/api/contracts/${contractId}/pickup`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitReturn(contractId, formData) {
    return apiClient.post(`/api/contracts/${contractId}/return`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
