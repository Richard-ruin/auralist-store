import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Profile from '../components/user/Profile';
import Orders from '../components/user/Orders';
import Wishlist from '../components/user/Wishlist';
import AddressBook from '../components/user/AddressBook';

const UserRoutes = () => {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/address-book" element={<AddressBook />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default UserRoutes;
