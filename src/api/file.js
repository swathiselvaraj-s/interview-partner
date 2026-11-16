import api from './client';

export const fileAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getResume: () => api.get('/files/resume'),
  
  deleteResume: () => api.delete('/files/resume'),
};