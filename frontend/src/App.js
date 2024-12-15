import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/Home';
import ShopPage from './pages/Shop';
import AboutPage from './pages/About';
import CategoriesPage from './pages/Categories';
import ContactPage from './pages/Contact';
import NotFoundPage from './pages/NotFound';
import ProductDetail from './components/product/ProductDetail';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Routes
import UserRoutes from './routes/userRoutes';
import AdminRoutes from './routes/adminRoutes';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// provider
import { CategoryProvider } from './context/CategoryContext';
import { BrandProvider } from './context/BrandContext';
import { ProductProvider } from './context/ProductContext';
import { UserProvider } from './context/UserContext';
import { PaymentProvider } from './context/PaymentContext';
import { OrderProvider } from './context/OrderContext';
import { WishlistProvider } from './context/WishlistContext';

const App = () => {
  return (
    <Router>
      <CategoryProvider>
        <BrandProvider>
        <ProductProvider>
          <UserProvider>
            <PaymentProvider>
              <OrderProvider>
                <WishlistProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        } />
        <Route path="/register" element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        } />
        <Route path="/forgot-password" element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        } />
        <Route path="/reset-password/:token" element={
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        } />

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* User Protected Routes */}
          <Route path="/user/*" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <UserRoutes />
            </ProtectedRoute>
          } />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </WishlistProvider>
      </OrderProvider>
      </PaymentProvider>
      </UserProvider>
      </ProductProvider>
      </BrandProvider>
      </CategoryProvider>
    </Router>
  );
};

export default App;