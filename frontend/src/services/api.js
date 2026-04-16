const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  },

  // Auth
  login: (credentials) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => api.request('/auth/me'),

  // Vehicles
  getVehicles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.request(`/vehicles${query ? `?${query}` : ''}`);
  },
  getVehicle: (id) => api.request(`/vehicles/${id}`),
  createVehicle: (data) => api.request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => api.request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => api.request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: () => api.request('/bookings'),
  getBooking: (id) => api.request(`/bookings/${id}`),
  createBooking: (data) => api.request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id, status) => api.request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Payments
  createPayment: (data) => api.request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  processPayment: (id) => api.request(`/payments/${id}/process`, { method: 'POST' }),
  getMyPayments: () => api.request('/payments/my-payments'),

  // Notifications
  getNotifications: () => api.request('/notifications'),
  getUnreadNotifications: () => api.request('/notifications/unread'),
  getNotificationCount: () => api.request('/notifications/count'),
  markAsRead: (id) => api.request(`/notifications/${id}/read`, { method: 'PUT' }),
};
