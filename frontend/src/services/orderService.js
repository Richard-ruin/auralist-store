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

  // Update order
  updateOrder: async (orderId, data) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, data) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: data.status,
        notes: data.notes
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get single order details
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }
};

export default orderService;