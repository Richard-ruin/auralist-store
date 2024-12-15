// src/hooks/useWishlist.js
import { useContext, useEffect } from 'react';
import { WishlistContext } from '../context/WishlistContext';

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  // Hanya fetch sekali saat komponen mount
  useEffect(() => {
    if (context.wishlistItems.length === 0) {
      context.fetchWishlist();
    }
  }, []); // Hapus context.fetchWishlist dari dependencies

  return context;
};