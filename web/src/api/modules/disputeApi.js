import apiClient from '../client';

export const disputeApi = {
  async getMyDisputes() {
    try {
      return await apiClient.get('/api/disputes/my-disputes');
    } catch {
      return apiClient.get('/api/disputes/pending/list');
    }
  },
  getPending() {
    return apiClient.get('/api/disputes/pending/list');
  },
  getApproved() {
    return apiClient.get('/api/disputes/approved/list');
  },
  getAdminDisputes(params = {}) {
    return apiClient.get('/api/disputes/admin/list', { params });
  },
  create(payload) {
    return apiClient.post('/api/disputes', payload);
  },
  approve(disputeId, payload) {
    return apiClient.put(`/api/disputes/${disputeId}/approve`, payload);
  },
  reject(disputeId, payload = {}) {
    return apiClient.put(`/api/disputes/${disputeId}/reject`, payload);
  }
};
