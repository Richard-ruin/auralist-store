// src/services/products.js
import api from './api';

export const productService = {
  // Get all products with filters and pagination
  getAllProducts: async (params = {}) => {
    const { page = 1, limit = 10, search, status, minPrice, maxPrice } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice })
    }).toString();
    
    return api.get(`/products?${queryParams}`);
  },

  // Get single product
  getProduct: (id) => {
    return api.get(`/products/${id}`);
  },

  // Create new product with images
  createProduct: (productData) => {
    const formData = new FormData();
    
    // Append product data
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Append images
    if (productData.images) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Update product
  updateProduct: (id, productData) => {
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    if (productData.images) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return api.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Delete product
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  }
};