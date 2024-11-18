import React from 'react';
// Pastikan path import sesuai dengan struktur folder
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSection from '../components/home/HeroSection.js';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeaturesSection from '../components/home/FeaturesSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;