// services/order.js
import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response;
  },

  getOrder: async (orderId) => {
    // Add authorization header explicitly
    const token = localStorage.getItem('token');
    const response = await api.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  },

  getMyOrders: async () => {
    // Add authorization header explicitly
    const token = localStorage.getItem('token');
    const response = await api.get('/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  },

  // Admin endpoints
  getAllOrders: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  },

  updateOrderStatus: async (orderId, status) => {
    const token = localStorage.getItem('token');
    const response = await api.patch(
      `/orders/${orderId}/status`, 
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response;
  }
};

export default orderService;