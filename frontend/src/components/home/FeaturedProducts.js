import React from 'react';
import ProductCard from '../product/ProductCard';

const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: 1,
      name: 'HD 660S',
      description: 'Reference-class open-back headphones',
      price: 499.99,
      image: '/images/products/hd660s.jpg',
      brand: 'Sennheiser'
    },
    {
      id: 2,
      name: 'KEF LS50 Meta',
      description: 'Audiophile loudspeakers',
      price: 1499.99,
      image: '/images/products/kef-ls50.jpg',
      brand: 'KEF'
    },
    {
      id: 3,
      name: 'Cambridge CXA81',
      description: 'Integrated stereo amplifier',
      price: 1299.99,
      image: '/images/products/cambridge-cxa81.jpg',
      brand: 'Cambridge Audio'
    },
    {
      id: 4,
      name: 'Focal Clear MG',
      description: 'High-end open-back headphones',
      price: 1499.99,
      image: '/images/products/focal-clear.jpg',
      brand: 'Focal'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Featured Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;