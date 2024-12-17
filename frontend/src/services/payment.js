// services/payment.js
import api from './api';

const paymentService = {
  createPayment: async (orderId, paymentMethod, proofImage) => {
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('paymentMethod', paymentMethod);
      formData.append('proofImage', proofImage);

      console.log('Sending payment data:', {
        orderId,
        paymentMethod,
        proofImage: proofImage.name
      });

      const response = await api.post('/payments/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    } catch (error) {
      console.error('Payment service error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },
  getBankAccounts: async () => {
    const response = await api.get('/payments/bank-accounts');
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