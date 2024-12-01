import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-96 bg-gray-900 mt-16">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/product/1.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60" />
      <div className="container mx-auto px-4 h-full flex items-center relative">
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Experience Pure Sound</h2>
          <p className="text-lg mb-8">
            Discover our collection of premium audio equipment for the true audiophile
          </p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-white text-gray-900 px-8 py-3 rounded-md font-semibold 
                     hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;