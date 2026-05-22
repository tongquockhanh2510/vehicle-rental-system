import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login: (email, password) => api.post('/users/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
};

export const vehicleAPI = {
  getAvailable: (filters) => api.get('/vehicles/available/list', { params: filters }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  getOwnerVehicles: () => api.get('/vehicles/owner/my-vehicles'),
  addImages: (id, images) => api.post(`/vehicles/${id}/images`, { images })
};

export const rentalAPI = {
  createRequest: (data) => api.post('/rentals/request', data),
  getById: (id) => api.get(`/rentals/${id}`),
  getRenterRentals: () => api.get('/rentals/renter/my-rentals'),
  getOwnerRentals: () => api.get('/rentals/owner/my-rentals'),
  confirmRental: (id) => api.put(`/rentals/${id}/confirm`),
  rejectRental: (id, reason) => api.put(`/rentals/${id}/reject`, { reason }),
  cancelRental: (id) => api.put(`/rentals/${id}/cancel`),
  checkAvailability: (vehicleId, startDate, endDate) => 
    api.post('/rentals/check-availability', { vehicle_id: vehicleId, start_date: startDate, end_date: endDate })
};

export const contractAPI = {
  create: (data) => api.post('/contracts', data),
  getById: (id) => api.get(`/contracts/${id}`),
  getRenterContracts: () => api.get('/contracts/renter/my-contracts'),
  getOwnerContracts: () => api.get('/contracts/owner/my-contracts'),
  complete: (id) => api.put(`/contracts/${id}/complete`),
  cancel: (id, data) => api.put(`/contracts/${id}/cancel`, data)
};

export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  processPayment: (id, transactionId) => api.put(`/payments/${id}/process`, { transaction_id: transactionId }),
  getRenterPayments: () => api.get('/payments/renter/my-payments'),
  getOwnerPayments: () => api.get('/payments/owner/my-payments')
};

export const inspectionAPI = {
  create: (data) => api.post('/inspections', data),
  getById: (id) => api.get(`/inspections/${id}`),
  getByRental: (rentalId) => api.get(`/inspections/rental/${rentalId}/inspections`),
  compare: (rentalId) => api.get(`/inspections/rental/${rentalId}/comparison`),
  approve: (id, notes) => api.put(`/inspections/${id}/approve`, { owner_approval_notes: notes })
};

export const disputeAPI = {
  create: (data) => api.post('/disputes', data),
  getById: (id) => api.get(`/disputes/${id}`),
  getPending: () => api.get('/disputes/pending/list'),
  approve: (id, data) => api.put(`/disputes/${id}/approve`, data),
  reject: (id, data) => api.put(`/disputes/${id}/reject`, data)
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByUser: (userId) => api.get(`/reviews/user/${userId}/reviews`),
  getRating: (userId) => api.get(`/reviews/user/${userId}/rating`),
  getByVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}/reviews`)
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications/my-notifications'),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read')
};

export const statisticAPI = {
  getDashboard: () => api.get('/statistics/dashboard'),
  getRevenueByMonth: () => api.get('/statistics/revenue-by-month'),
  getTopVehicles: () => api.get('/statistics/top-vehicles'),
  getDisputes: () => api.get('/statistics/disputes')
};

export default api;
