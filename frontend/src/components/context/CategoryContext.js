import React, { createContext, useState, useContext } from 'react';
import * as api from '../services/api';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.getCategories();
      setCategories(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (formData) => {
    try {
      const { data } = await api.createCategory(formData);
      setCategories([...categories, data.data]);
      return data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error creating category');
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const { data } = await api.updateCategory(id, formData);
      setCategories(categories.map(cat => cat._id === id ? data.data : cat));
      return data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error updating category');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      loading,
      error,
      fetchCategories,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);