import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/categories', label: 'Categories' },
    { path: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto max-h-full`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">AURALIST</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Account Section */}
        <div className="border-t px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase">
            Account
          </h3>
          <div className="mt-4 space-y-2">
            <Link
              to="/login"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              Register
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        <div className="border-t px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase">
            Categories
          </h3>
          <div className="mt-4 space-y-2">
            <Link
              to="/category/headphones"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              Headphones
            </Link>
            <Link
              to="/category/speakers"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              Speakers
            </Link>
            <Link
              to="/category/amplifiers"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              Amplifiers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
