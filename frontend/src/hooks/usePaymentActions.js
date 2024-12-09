// src/hooks/usePaymentActions.js
import { useCallback } from 'react';
import { usePayment, PAYMENT_ACTIONS } from '../context/PaymentContext';
import paymentService from '../services/payment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const usePaymentActions = () => {
  const { dispatch } = usePayment();
  const navigate = useNavigate();

  // Utility function to handle errors
  const handleError = useCallback((error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR,
      payload: errorMessage
    });
    toast.error(errorMessage);
  }, [dispatch]);

  // Initiate bank transfer payment
  const initiateBankTransfer = useCallback(async (orderId) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      const response = await paymentService.initiateBankTransfer(orderId);
      dispatch({
        type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
        payload: response.data.payment
      });
      toast.success('Payment initiated successfully');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [dispatch, handleError]);

  // Submit transfer proof
  const submitTransferProof = useCallback(async (paymentId, formData) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      const response = await paymentService.submitTransferProof(paymentId, formData);
      dispatch({
        type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
        payload: response.data.payment
      });
      toast.success('Transfer proof submitted successfully');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [dispatch, handleError]);

  // Process credit card payment
  const processCreditCard = useCallback(async (orderId, cardDetails) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      const response = await paymentService.processCreditCard(orderId, cardDetails);
      dispatch({
        type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
        payload: response.data.payment
      });
      toast.success('Payment processed successfully');
      navigate('/payment/success');
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [dispatch, handleError, navigate]);

  // Get payment details
  const getPaymentDetails = useCallback(async (paymentId) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      const response = await paymentService.getPaymentDetails(paymentId);
      dispatch({
        type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
        payload: response.data.payment
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [dispatch, handleError]);

  // Get payment history
  const getPaymentHistory = useCallback(async () => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      const response = await paymentService.getPaymentHistory();
      dispatch({
        type: PAYMENT_ACTIONS.SET_PAYMENT_HISTORY,
        payload: response.data.payments
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [dispatch, handleError]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  return {
    initiateBankTransfer,
    submitTransferProof,
    processCreditCard,
    getPaymentDetails,
    getPaymentHistory,
    clearError
  };
};

export default usePaymentActions;