import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.patch(`/auth/reset-password/${token}`, { password });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.patch('/users/profile', userData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.patch('/auth/update-password', {
      currentPassword,
      newPassword
    });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response;
  } catch (error) {
    logout();
    throw error.response?.data || error.message;
  }
};