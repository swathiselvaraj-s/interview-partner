import api from './client';

export const interviewAPI = {
  // Interview Sessions
  startInterview: (data) => api.post('/interviews/start', data),
  
  getNextQuestion: (sessionId) => api.get(`/interviews/${sessionId}/next-question`),
  
  submitAnswer: (sessionId, data) => api.post(`/interviews/${sessionId}/answer`, data),
  
  getSessionStatus: (sessionId) => api.get(`/interviews/${sessionId}/status`),
  
  endInterview: (sessionId, data) => api.post(`/interviews/${sessionId}/end`, data),
  
  getSessionHistory: (page = 0, size = 10) => api.get(`/interviews/history?page=${page}&size=${size}`),

  getUserHistoryForAdmin: (userId, page = 0, size = 10) => api.get(`/interviews/admin/user/${userId}?page=${page}&size=${size}`),

  getSessionDetails: (sessionId) => api.get(`/interviews/${sessionId}`),
  
  getAllQuestions: (sessionId) => api.get(`/interviews/${sessionId}/questions`),
  
  abandonSession: (sessionId) => api.delete(`/interviews/${sessionId}`),
  
  isSessionActive: (sessionId) => api.get(`/interviews/${sessionId}/active`),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};