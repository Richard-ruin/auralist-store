import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    try {
      const formattedData = {
        items: orderData.items.map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'pending',
        totalAmount: Number(orderData.totalAmount),
        currency: orderData.currency || 'USD',
        status: orderData.status || 'processing'
      };

      console.log('Sending formatted order data:', formattedData);

      const response = await api.post('/orders', formattedData);
      return response;
    } catch (error) {
      console.error('Order service error:', {
        message: error.message,
        response: error.response?.data,
        data: error.response?.data?.data
      });
      throw error;
    }
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },

  updateOrder: async (orderId, updateData) => {
    const response = await api.patch(`/orders/${orderId}`, updateData);
    return response;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response;
  }
};

export default orderService;