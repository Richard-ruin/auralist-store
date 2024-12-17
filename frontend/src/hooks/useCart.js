// src/hooks/useCart.js
import { useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  useEffect(() => {
    context.fetchCart();
  }, []);

  return context;
};

export default useCart;