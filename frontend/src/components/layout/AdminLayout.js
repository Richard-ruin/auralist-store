import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  Settings, LogOut, Menu, X, FolderTree, 
  BarChart3, Tag, ChevronRight
} from 'lucide-react';
import { logout } from '../../services/auth'; // Sesuaikan path import ini dengan struktur proyek Anda

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { title: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { title: 'Categories', icon: <FolderTree size={20} />, path: '/admin/categories' },
    { title: 'Brands', icon: <Tag size={20} />, path: '/admin/brands' },
    { title: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { title: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
    { title: 'Community Channels', icon: <ChevronRight size={20} />, path: '/admin/community-channels' },
    { title: 'Chats', icon: <ChevronRight size={20} />, path: '/admin/chats' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' }
  ];

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-64 bg-gray-800 text-white
          transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 bg-gray-900">
          <span className="text-xl font-bold tracking-wider">Admin Panel</span>
          {isMobile && (
            <button onClick={toggleSidebar} className="lg:hidden p-1 hover:bg-gray-700 rounded">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100%-4rem)] py-4">
          <div className="flex-1 space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-lg
                    transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                >
                  <span className="inline-flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="ml-3 flex-1">{item.title}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout} // Fungsi logout dipanggil di sini
            className="
              mx-3 px-3 py-2 flex items-center text-gray-300
              hover:bg-gray-700 hover:text-white rounded-lg
              transition-colors duration-200
            "
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
