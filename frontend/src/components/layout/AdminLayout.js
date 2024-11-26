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
  BarChart3
} from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard />, path: '/admin/dashboard' },
    { title: 'Products', icon: <Package />, path: '/admin/products' },
    { title: 'Categories', icon: <FolderTree />, path: '/admin/categories' },
    { title: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
    { title: 'Users', icon: <Users />, path: '/admin/users' },
    { title: 'Analytics', icon: <BarChart3 />, path: '/admin/analytics' },
    { title: 'Settings', icon: <Settings />, path: '/admin/settings' }
  ];

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-gray-800 text-white fixed inset-y-0 left-0 transform transition-transform duration-300 lg:translate-x-0`}
      >
        <div className="p-4 font-bold text-center text-2xl">Admin Panel</div>
        <nav>
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
        </nav>
        <button
          className="mt-auto w-full px-4 py-2 bg-gray-900 hover:bg-gray-700"
          onClick={() => alert('Logout clicked')}
        >
          <LogOut className="inline-block mr-2" /> Logout
        </button>
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