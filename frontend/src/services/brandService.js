// services/brandService.js
import api from './api';

export const brandService = {
  getAll: () => api.get('/brands'),
  
  create: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' }};
    return api.post('/brands', formData, config);
  },
  
  update: (id, formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' }};
    return api.patch(`/brands/${id}`, formData, config);
  },
  
  delete: (id) => api.delete(`/brands/${id}`)
};