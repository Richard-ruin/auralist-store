import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';

const Header = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleUserClick = () => {
    if (user) {
      navigate('/user/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm fixed w-full top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Menu 
                className="h-6 w-6 md:hidden cursor-pointer hover:text-gray-900 transition-colors" 
                onClick={toggleSidebar}
              />
              <h1 
                className="ml-4 text-2xl font-bold text-gray-900 cursor-pointer" 
                onClick={() => navigate('/')}
              >
                AURALIST
              </h1>
            </div>
            
            <Navigation />
            
            <div className="flex items-center space-x-4">
              <SearchBar />
              <User 
                className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors" 
                onClick={handleUserClick}
              />
              <Heart 
                className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => user ? navigate('/user/wishlist') : navigate('/login')}
              />
              <ShoppingCart 
                className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => user ? navigate('/cart') : navigate('/login')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
};

export default Header;