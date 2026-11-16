import api from './client';

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  
  getCategoryScores: () => api.get('/analytics/scores'),
  
  getTrends: (days = 30) => api.get(`/analytics/trends?days=${days}`),
  
  getWeakTopics: () => api.get('/analytics/weak-topics'),
  
  getRecommendations: () => api.get('/analytics/recommendations'),
  
  getImprovement: () => api.get('/analytics/improvement'),
};