import React from 'react';
import { ShoppingCart, Search, Menu, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import SearchBar from './SearchBar';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Menu className="h-6 w-6 md:hidden cursor-pointer" />
            <h1 className="ml-4 text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
              AURALIST
            </h1>
          </div>
          
          <Navigation />
          
          <div className="flex items-center space-x-4">
            <SearchBar />
            <User 
              className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors" 
              onClick={() => navigate('/login')}
            />
            <Heart className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors" />
            <ShoppingCart className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;