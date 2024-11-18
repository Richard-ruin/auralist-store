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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h5 className="text-lg font-bold mb-4">AURALIST</h5>
            <p className="text-gray-400 text-sm">
              Premium audio equipment for the discerning listener
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h5 className="text-lg font-bold mb-4">Shop</h5>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h5 className="text-lg font-bold mb-4">Support</h5>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-lg font-bold mb-4">Newsletter</h5>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for updates and exclusive offers
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md flex-1 focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
              <button 
                type="submit"
                className="bg-white text-gray-900 px-4 py-2 rounded-r-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Auralist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;