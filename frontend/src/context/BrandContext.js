// src/context/BrandContext.js
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get('/brands');
      setBrands(response.data.data);
    } catch (err) {
      setError(err.message || 'Error fetching brands');
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async (formData) => {
    try {
      const response = await api.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBrands([...brands, response.data.data]);
      return response.data.data;
    } catch (err) {
      throw new Error(err.message || 'Error creating brand');
    }
  };

  const updateBrandById = async (id, formData) => {
    try {
      const response = await api.patch(`/brands/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBrands(brands.map(brand => brand._id === id ? response.data.data : brand));
      return response.data.data;
    } catch (err) {
      throw new Error(err.message || 'Error updating brand');
    }
  };

  const deleteBrandById = async (id) => {
    try {
      await api.delete(`/brands/${id}`);
      setBrands(brands.filter(brand => brand._id !== id));
    } catch (err) {
      throw new Error(err.message || 'Error deleting brand');
    }
  };

  return (
    <BrandContext.Provider value={{
      brands,
      loading,
      error,
      fetchBrands,
      addBrand,
      updateBrand: updateBrandById,
      deleteBrand: deleteBrandById
    }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider');
  }
  return context;
};