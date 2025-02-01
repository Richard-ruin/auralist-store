// services/returnService.js
import api from './api';

const returnService = {
  submitReturn: async (orderId, formData) => {
    try {
      const response = await api.post(`/orders/${orderId}/return`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting return:', error);
      throw error;
    }
  },

  checkCanReturn: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/can-return`);
      return response.data;
    } catch (error) {
      console.error('Error checking return capability:', error);
      return { canReturn: false };
    }
  }
};

export default returnService;