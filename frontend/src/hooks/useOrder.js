// hooks/useOrder.js
import { useCallback } from 'react';
import { useOrderContext } from '../context/OrderContext';
import orderService from '../services/order';

export const useOrder = () => {
  const { state, dispatch } = useOrderContext();

  const createOrder = useCallback(async (orderData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await orderService.createOrder(orderData);
      dispatch({ type: 'SET_CURRENT_ORDER', payload: response.data.order });
      return response.data.order;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const getMyOrders = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await orderService.getMyOrders();
      dispatch({ type: 'SET_ORDERS', payload: response.data.orders });
      return response.data.orders;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const getOrder = useCallback(async (orderId) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await orderService.getOrder(orderId);
      dispatch({ type: 'SET_CURRENT_ORDER', payload: response.data.order });
      return response.data.order;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      dispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: { orderId, status: response.data.order.status }
      });
      return response.data.order;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus
  };
};

