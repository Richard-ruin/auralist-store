import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeaturesSection from '../components/home/FeaturesSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
