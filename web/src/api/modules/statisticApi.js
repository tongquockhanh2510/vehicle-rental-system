import apiClient from '../client';

export const statisticApi = {
  getDashboard() {
    return apiClient.get('/api/statistics/dashboard');
  },
  getRevenueByMonth(months = 6) {
    return apiClient.get('/api/statistics/revenue-by-month', { params: { months } });
  },
  getTopVehicles(limit = 8) {
    return apiClient.get('/api/statistics/top-vehicles', { params: { limit } });
  }
};
