import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/categories', label: 'Categories' },
    { path: '/brands', label: 'Brands' },
    { path: '/about', label: 'About' }
  ];

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;