// components/layout/AdminLayout.js
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  X,
  FolderTree,
  BarChart3,
  Tag
} from 'lucide-react';
import { logout } from '../../services/auth'; // Import the logout function

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard />, path: '/admin/dashboard' },
    { title: 'Products', icon: <Package />, path: '/admin/products' },
    { title: 'Categories', icon: <FolderTree />, path: '/admin/categories' },
    { title: 'Brands', icon: <Tag />, path: '/admin/brands' },
    { title: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
    { title: 'Users', icon: <Users />, path: '/admin/users' },
    { title: 'Analytics', icon: <BarChart3 />, path: '/admin/analytics' },
    { title: 'Settings', icon: <Settings />, path: '/admin/settings' }
  ];

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout(); // This will handle token removal and redirect
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-gray-800 text-white fixed inset-y-0 left-0 transform transition-transform duration-300 lg:translate-x-0`}
      >
        <div className="p-4 font-bold text-center text-2xl">Admin Panel</div>
        <nav className="flex flex-col h-[calc(100%-8rem)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg hover:bg-gray-700 ${
                location.pathname === item.path ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </div>
            </Link>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-auto px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center"
          >
            <LogOut className="mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Toggle Button */}
        <button
          className="lg:hidden px-4 py-2 bg-gray-800 text-white"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X /> : <MenuIcon />}
        </button>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;