// frontend/src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as authService from '../services/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { setUser, setIsAuthenticated } = context;

  const logout = async () => {
    try {
      await authService.logout(); // Call the logout API endpoint
      
      // Clear user data from context
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any stored tokens or user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    ...context,
    logout,
  };
};