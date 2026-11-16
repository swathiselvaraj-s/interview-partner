import api from './client';

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  
  updateProfile: (data) => api.put('/users/me', data),
  
  updatePreferences: (data) => api.patch('/users/me/preferences', data),
  
  changePassword: (data) => api.post('/users/me/change-password', data),
  
  deleteAccount: () => api.delete('/users/me'),
  
  checkEmailAvailable: (email) => api.get(`/users/me/available?email=${email}`),

  getAllUsers: (page = 0, size = 20) => api.get(`/users/admin/all?page=${page}&size=${size}`),

  getUserById: (userId) => api.get(`/users/admin/${userId}`),
};