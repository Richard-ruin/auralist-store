// frontend/src/services/users.js
import api from './api';

export const getUsers = async (params) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/users/stats');
  return response.data;
};

// Add this if you need to handle user authentication specifically
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Add this if you need to update user's own profile
export const updateProfile = async (userData) => {
  const response = await api.patch('/users/profile', userData);
  return response.data;
};

// Add this if you need to change user's password
export const changePassword = async (passwordData) => {
  const response = await api.patch('/users/change-password', passwordData);
  return response.data;
};