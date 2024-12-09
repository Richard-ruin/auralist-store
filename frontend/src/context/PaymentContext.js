
// context/PaymentContext.js
import React, { createContext, useReducer, useContext } from 'react';

const PaymentContext = createContext();

const initialState = {
  bankAccounts: null,
  currentPayment: null,
  paymentStatus: null,
  loading: false,
  error: null
};

const paymentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_BANK_ACCOUNTS':
      return { ...state, bankAccounts: action.payload, loading: false };
    case 'SET_CURRENT_PAYMENT':
      return { ...state, currentPayment: action.payload, loading: false };
    case 'SET_PAYMENT_STATUS':
      return { ...state, paymentStatus: action.payload, loading: false };
    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        currentPayment: {
          ...state.currentPayment,
          status: action.payload
        },
        loading: false
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  return (
    <PaymentContext.Provider value={{ state, dispatch }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};