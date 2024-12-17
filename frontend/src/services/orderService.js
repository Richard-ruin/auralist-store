import api from './api';

const orderService = {
  // Get all orders for admin
  getAllOrders: async () => {
    const response = await api.get('/orders/all');
    return response.data;
  },

  // Get order statistics
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (orderId, data) => {
    const response = await api.patch(`/orders/${orderId}/confirm-payment`, {
      status: data.status,
      notes: data.notes
    });
    return response.data;
  },

  // Get single order details
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }
};

export default orderService;