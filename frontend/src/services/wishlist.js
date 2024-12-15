// services/wishlistService.js
import api from './api';

const wishlistService = {
 // Get wishlist items
 getWishlist: async () => {
   try {
     const response = await api.get('/wishlist');
     return response.data;
   } catch (error) {
     throw error.response?.data || error;
   }
 },

 // Add item to wishlist
 addToWishlist: async (productId) => {
   try {
     const response = await api.post('/wishlist', { productId });
     return response.data;
   } catch (error) {
     throw error.response?.data || error;
   }
 },

 // Remove item from wishlist 
 removeFromWishlist: async (productId) => {
   try {
     const response = await api.delete(`/wishlist/${productId}`);
     return response.data;
   } catch (error) {
     throw error.response?.data || error;
   }
 },

 // Clear entire wishlist
 clearWishlist: async () => {
   try {
     const response = await api.delete('/wishlist');
     return response.data;
   } catch (error) {
     throw error.response?.data || error;
   }
 },

 // Check if product is in wishlist
 checkWishlistItem: async (productId) => {
   try {
     const response = await api.get(`/wishlist/check/${productId}`);
     return response.data;
   } catch (error) {
     throw error.response?.data || error;
   }
 }
};

export default wishlistService;