// frontend/src/services/reportService.js
import api from './api';

const reportService = {
  getProductReport: async () => {
    try {
      const response = await api.get('/reports/products');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default reportService;