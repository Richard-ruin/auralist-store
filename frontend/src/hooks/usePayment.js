// hooks/usePayment.js
import { useCallback } from 'react';
import { usePaymentContext } from '../context/PaymentContext';
import paymentService from '../services/payment';

export const usePayment = () => {
  const { state, dispatch } = usePaymentContext();

  const getBankAccounts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await paymentService.getBankAccounts();
      dispatch({ type: 'SET_BANK_ACCOUNTS', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const createPayment = useCallback(async (orderId, paymentMethod, proofImage) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await paymentService.createPayment(orderId, paymentMethod, proofImage);
      dispatch({ type: 'SET_CURRENT_PAYMENT', payload: response.data.payment });
      return response.data.payment;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const getPaymentStatus = useCallback(async (paymentId) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await paymentService.getPaymentStatus(paymentId);
      dispatch({ type: 'SET_PAYMENT_STATUS', payload: response.data.payment });
      return response.data.payment;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const confirmPayment = useCallback(async (paymentId, status, notes) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const response = await paymentService.confirmPayment(paymentId, status, notes);
      dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: status });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  // Add a hook for checking payment expiration
  const checkPaymentExpiration = useCallback((payment) => {
    if (!payment || !payment.expiredAt) return true;
    const now = new Date();
    const expiredAt = new Date(payment.expiredAt);
    return now > expiredAt;
  }, []);

  return {
    ...state,
    getBankAccounts,
    createPayment,
    getPaymentStatus,
    confirmPayment,
    checkPaymentExpiration
  };
};