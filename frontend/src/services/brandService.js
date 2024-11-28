// services/brandService.js
import api from './api';

export const brandService = {
  getAll: async () => {
    const response = await api.get('/brands');
    return response.data;
  },
  
  create: async (formData) => {
    const response = await api.post('/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  update: async (id, formData) => {
    const response = await api.patch(`/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  }
};