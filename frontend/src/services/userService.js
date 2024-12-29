// services/userService.js
import api from './api';

export const userService = {
  updateProfile: async (formData) => {
    const response = await api.patch('/users/profile', formData);
    return response.data;
  },
  
  updateAvatar: async (id, formData) => {
    const response = await api.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  resetAvatar: async (id) => {
    const response = await api.post(`/users/${id}/avatar/reset`);
    return response.data;
  }
};