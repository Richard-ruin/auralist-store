import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    shop: [
      { label: 'Headphones', path: '/category/headphones' },
      { label: 'Speakers', path: '/category/speakers' },
      { label: 'Amplifiers', path: '/category/amplifiers' },
      { label: 'Accessories', path: '/category/accessories' }
    ],
    support: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/faqs' },
      { label: 'Shipping', path: '/shipping' },
      { label: 'Returns', path: '/returns' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Auralist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;