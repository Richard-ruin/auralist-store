import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import BrandSection from '../components/home/BrandSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeaturesSection from '../components/home/FeaturesSection';
import RecommendationsSection from '../components/home/RecommendationsSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <RecommendationsSection />
      <CategorySection />
      <BrandSection />
      <FeaturedProducts />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
