import api from './client';

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  updatePreferences: (data) => api.patch('/users/me/preferences', data),
  changePassword: (data) => api.post('/users/me/change-password', data),
  deleteAccount: () => api.delete('/users/me'),
};