// services/categoryService.js
import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories'),
  
  create: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' }};
    return api.post('/categories', formData, config);
  },
  
  update: (id, formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' }};
    return api.patch(`/categories/${id}`, formData, config);
  },
  
  delete: (id) => api.delete(`/categories/${id}`)
};