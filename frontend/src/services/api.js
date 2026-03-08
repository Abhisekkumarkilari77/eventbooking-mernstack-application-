import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Events
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getFeatured: () => api.get('/events/featured'),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getMyEvents: () => api.get('/events/organizer/my-events')
};

// Venues
export const venueAPI = {
  getAll: (params) => api.get('/venues', { params }),
  getOne: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`)
};

// Artists
export const artistAPI = {
  getAll: (params) => api.get('/artists', { params }),
  getOne: (id) => api.get(`/artists/${id}`),
  create: (data) => api.post('/artists', data),
  update: (id, data) => api.put(`/artists/${id}`, data),
  delete: (id) => api.delete(`/artists/${id}`)
};

// Seats
export const seatAPI = {
  getEventSeats: (eventId) => api.get(`/seats/event/${eventId}`),
  getSeat: (id) => api.get(`/seats/${id}`),
  blockSeats: (data) => api.put('/seats/block', data)
};

// Bookings
export const bookingAPI = {
  bookNow: (data) => api.post('/bookings/book', data),
  reserve: (data) => api.post('/bookings/reserve', data),
  confirm: (data) => api.post('/bookings/confirm', data),
  cancel: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getOne: (id) => api.get(`/bookings/${id}`)
};

// Tickets
export const ticketAPI = {
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getOne: (id) => api.get(`/tickets/${id}`),
  checkin: (data) => api.post('/tickets/checkin', data)
};

// Schedules
export const scheduleAPI = {
  getEventSchedules: (eventId) => api.get(`/schedules/event/${eventId}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`)
};

// Analytics
export const analyticsAPI = {
  getEventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`),
  getDashboard: () => api.get('/analytics/dashboard')
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export default api;
