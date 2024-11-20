import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Profile from '../components/user/Profile';
import Orders from '../components/user/Orders';
import Wishlist from '../components/user/Wishlist';
import AddressBook from '../components/user/AddressBook';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Wishlist />
        </ProtectedRoute>
      } />
      <Route path="/address-book" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <AddressBook />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default UserRoutes;