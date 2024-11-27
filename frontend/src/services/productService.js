// services/productService.js
import api from './api';

export const productService = {
  getAll: () => api.get('/products'),
  
  create: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' }};
    return api.post('/products', formData, config);
  },
  
  update: (id, formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' }};
    return api.patch(`/products/${id}`, formData, config);
  },
  
  delete: (id) => api.delete(`/products/${id}`)
};