// services/payment.js
import api from './api';

const paymentService = {
  getBankAccounts: async () => {
    const response = await api.get('/payments/bank-accounts');
    return response.data;
  },

  createPayment: async (orderId, paymentMethod, proofImage) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('paymentMethod', paymentMethod);
    formData.append('proofImage', proofImage);

    const response = await api.post('/payments/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  // Admin endpoint
  confirmPayment: async (paymentId, status, notes) => {
    const response = await api.patch(`/payments/confirm/${paymentId}`, {
      status,
      notes
    });
    return response.data;
  }
};

export default paymentService;