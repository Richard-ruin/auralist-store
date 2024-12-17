import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import BrandSection from '../components/home/BrandSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeaturesSection from '../components/home/FeaturesSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <CategorySection />
      <BrandSection />
      <FeaturedProducts />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
