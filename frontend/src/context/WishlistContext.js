// src/context/WishlistContext.js
import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import wishlistService from '../services/wishlistService';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchedRef = useRef(false);

  const fetchWishlist = useCallback(async () => {
    if (loading || fetchedRef.current) return;
    
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlistItems(data);
      fetchedRef.current = true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch wishlist items');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId || item._id === productId);
  }, [wishlistItems]);

  const addToWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      await wishlistService.addToWishlist(productId);
      const data = await wishlistService.getWishlist();
      setWishlistItems(data);
      toast.success('Item added to wishlist');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to add item to wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      await wishlistService.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      toast.success('Item removed from wishlist');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to remove item from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleWishlist = useCallback(async (productId) => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  useEffect(() => {
    return () => {
      fetchedRef.current = false;
    };
  }, []);

  const value = {
    wishlistItems,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};