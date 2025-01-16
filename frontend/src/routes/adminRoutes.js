import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import ProductManager from '../components/admin/ProductManager';
import OrderManager from '../components/admin/OrderManager';
import UserManager from '../components/admin/UserManager';
import CategoryManager from '../components/admin/CategoryManager';
import Analytics from '../components/admin/Analytics';
import Settings from '../components/admin/Settings';
import NotFoundPage from '../pages/NotFound';
import BrandManager from '../components/admin/BrandManager';
import CommunityChannelManager from '../components/admin/CommunityChannelManager';
import ChatManager from '../components/admin/ChatManager';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} /> 
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="brands" element={<BrandManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="/community-channels" element={<CommunityChannelManager />} />
        <Route path="chats" element={<ChatManager />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
