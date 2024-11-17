import React from 'react';
import { ShoppingCart, Search, Menu, User, Heart } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Menu className="h-6 w-6 md:hidden" />
              <h1 className="ml-4 text-2xl font-bold text-gray-900">AURALIST</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Shop</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Categories</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">About</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 text-gray-700" />
              <User className="h-5 w-5 text-gray-700" />
              <Heart className="h-5 w-5 text-gray-700" />
              <ShoppingCart className="h-5 w-5 text-gray-700" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="max-w-2xl text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Experience Pure Sound</h2>
            <p className="text-lg mb-8">Discover our collection of premium audio equipment for the true audiophile</p>
            <button className="bg-white text-gray-900 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Headphones', 'Speakers', 'Amplifiers'].map((category) => (
              <div key={category} className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gray-900 opacity-40 group-hover:opacity-50 transition"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="text-white text-xl font-bold">{category}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <div className="h-48 bg-gray-200"></div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium Headphones</h4>
                  <p className="text-gray-600 text-sm mb-2">High-fidelity audio experience</p>
                  <p className="text-gray-900 font-bold">$299.99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Free Shipping', description: 'On orders over $500' },
              { title: 'Expert Support', description: '24/7 audio specialist assistance' },
              { title: 'Premium Quality', description: 'Guaranteed authentic products' }
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-bold mb-4">AURALIST</h5>
              <p className="text-gray-400 text-sm">Premium audio equipment for the discerning listener</p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Shop</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Headphones</a></li>
                <li><a href="#" className="hover:text-white">Speakers</a></li>
                <li><a href="#" className="hover:text-white">Amplifiers</a></li>
                <li><a href="#" className="hover:text-white">Accessories</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">Shipping</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Newsletter</h5>
              <p className="text-gray-400 text-sm mb-4">Subscribe for updates and exclusive offers</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md flex-1"
                />
                <button className="bg-white text-gray-900 px-4 py-2 rounded-r-md font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Auralist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;