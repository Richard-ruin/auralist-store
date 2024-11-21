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

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Layout untuk halaman admin */}
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} /> {/* Default halaman */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />

        {/* 404 untuk rute yang tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
