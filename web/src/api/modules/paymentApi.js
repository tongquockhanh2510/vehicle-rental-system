import apiClient from '../client';

export const paymentApi = {
  getRenterPayments() {
    return apiClient.get('/api/payments/renter/my-payments');
  },
  getOwnerPayments() {
    return apiClient.get('/api/payments/owner/my-payments');
  },
  create(payload) {
    return apiClient.post('/api/payments', payload);
  },
  process(paymentId, payload) {
    return apiClient.put(`/api/payments/${paymentId}/process`, payload);
  },
  refund(paymentId) {
    return apiClient.post(`/api/payments/${paymentId}/refund`);
  }
};
