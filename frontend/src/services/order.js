// services/order.js
import api from './api';
import { handleError } from '../utils/errorHandler';
import { validateOrderData } from '../utils/ordervalidator';
import { toast } from 'react-hot-toast';

const orderService = {
  createOrder: async (orderData) => {
    try {
      // Validate order data
      const validation = validateOrderData(orderData);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        throw new Error(validation.errors.join(', '));
      }

      // Format data
      const formattedData = {
        items: orderData.items.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        })),
        shippingAddress: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postalCode: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country
        },
        totalAmount: parseFloat(orderData.totalAmount),
        status: orderData.status || 'processing'
      };

      console.log('Sending formatted data:', formattedData);

      const response = await api.post('/orders', formattedData);
      return response;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  },

  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      return response;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  }
};

export default orderService;