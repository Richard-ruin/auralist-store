import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: { featured: true, limit: 4 }
        });
        setFeaturedProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-black mb-4">Featured Collection</h2>
            <p className="text-gray-600 max-w-2xl">Discover our carefully curated selection of premium audio equipment, chosen for exceptional performance and design excellence.</p>
          </div>
          <a href="/shop" className="hidden md:flex items-center space-x-2 text-black hover:text-gray-600 transition-colors">
            <span className="font-medium">View All</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a href="/shop" className="inline-flex items-center space-x-2 text-black hover:text-gray-600 transition-colors">
            <span className="font-medium">View All Products</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;