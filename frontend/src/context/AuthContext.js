import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set initial state from localStorage
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify with backend
          try {
            const response = await api.get('/users/me');
            setUser(response.data.data);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to verify user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    // Set Authorization header for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  if (loading) {
    return null; // or your loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};