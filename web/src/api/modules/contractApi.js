import apiClient from '../client';

export const contractApi = {
  getRenterContracts() {
    return apiClient.get('/api/contracts/renter/my-contracts');
  },
  getOwnerContracts() {
    return apiClient.get('/api/contracts/owner/my-contracts');
  },
  getById(contractId) {
    return apiClient.get(`/api/contracts/${contractId}`);
  },
  pickup(contractId, formData) {
    return apiClient.put(`/api/contracts/${contractId}/pickup`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  returnVehicle(contractId, formData) {
    return apiClient.put(`/api/contracts/${contractId}/return`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
