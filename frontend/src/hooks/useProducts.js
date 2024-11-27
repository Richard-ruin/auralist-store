// src/hooks/useProducts.js
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { productService } from '../services/productService';
import { useProduct } from '../context/ProductContext';

export function useProducts() {
  const { state, dispatch } = useProduct();

  const fetchProducts = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await productService.getAllProducts(state.filters);
      
      dispatch({ type: 'SET_PRODUCTS', payload: response.data.data });
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        }
      });
    } catch (error) {
      toast.error('Failed to fetch products');
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, dispatch]);

  const createProduct = async (data) => {
    try {
      await productService.createProduct(data);
      toast.success('Product created successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
      throw error;
    }
  };

  const updateProduct = async (id, data) => {
    try {
      await productService.updateProduct(id, data);
      toast.success('Product updated successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, [dispatch]);

  return {
    ...state,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters
  };
}