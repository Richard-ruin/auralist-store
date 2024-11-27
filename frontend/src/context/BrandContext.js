import React, { createContext, useState, useContext } from 'react';
import * as api from '../services/api';


const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await api.getBrands();
      setBrands(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching brands');
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async (formData) => {
    try {
      const { data } = await api.createBrand(formData);
      setBrands([...brands, data.data]);
      return data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error creating brand');
    }
  };

  const updateBrand = async (id, formData) => {
    try {
      const { data } = await api.updateBrand(id, formData);
      setBrands(brands.map(brand => brand._id === id ? data.data : brand));
      return data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error updating brand');
    }
  };

  const deleteBrand = async (id) => {
    try {
      await api.deleteBrand(id);
      setBrands(brands.filter(brand => brand._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error deleting brand');
    }
  };

  return (
    <BrandContext.Provider value={{
      brands,
      loading,
      error,
      fetchBrands,
      addBrand,
      updateBrand,
      deleteBrand
    }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);