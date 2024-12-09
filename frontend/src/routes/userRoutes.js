import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Profile from '../components/user/Profile';
import Orders from '../components/user/Orders';
import Wishlist from '../components/user/Wishlist';
import AddressBook from '../components/user/AddressBook';
import Payment from '../pages/Payment';

const UserRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wishlist" 
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/address-book" 
        element={
          <ProtectedRoute>
            <AddressBook />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment" 
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment/:orderId" 
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default UserRoutes;