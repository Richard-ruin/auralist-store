// src/context/CartContext.js
import React, { createContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import cartService from '../services/cartService';
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data);
      toast.success('Item added to cart');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCartItem = useCallback(async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await cartService.updateCartItem(productId, quantity);
      setCart(response.data);
      toast.success('Cart updated');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    try {
      setLoading(true);
      const response = await cartService.removeFromCart(productId);
      setCart(response.data);
      toast.success('Item removed from cart');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to remove item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      toast.success('Cart cleared');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};