import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, Heart, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';

const Header = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollPosition(currentScrollY);
      
      // Show header when scrolling up or at top, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const headerClasses = `
    fixed w-full z-40 transition-all duration-300 ease
    ${isVisible ? 'top-0' : '-top-20'}
    ${scrollPosition > 80 ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white'}
  `;

  const iconClasses = "h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-all duration-300 hover:scale-110";

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Menu 
                className="h-6 w-6 md:hidden cursor-pointer hover:text-gray-900 transition-all duration-300 hover:scale-110" 
                onClick={toggleSidebar}
              />
              <h1 
                className="ml-4 text-2xl font-bold text-gray-900 cursor-pointer hover:text-black transition-colors duration-300" 
                onClick={() => navigate('/')}
              >
                AURALIST
              </h1>
            </div>
            
            <Navigation />
            
            <div className="flex items-center space-x-4">
              <SearchBar />
              <div className="flex items-center space-x-4 group">
                <User 
                  className={iconClasses}
                  onClick={handleUserClick}
                />
                <Heart 
                  className={iconClasses}
                  onClick={() => user ? navigate('/user/wishlist') : navigate('/login')}
                />
                <ShoppingCart 
                  className={iconClasses}
                  onClick={() => user ? navigate('/user/cart') : navigate('/login')}
                />
                <Package 
                  className={iconClasses}
                  onClick={() => user ? navigate('/user/orders') : navigate('/login')}
                />
              </div>
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