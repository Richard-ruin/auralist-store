// context/OrderContext.js
import React, { createContext, useReducer, useContext } from 'react';

const OrderContext = createContext();

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: false };
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload, loading: false };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
        loading: false
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};
