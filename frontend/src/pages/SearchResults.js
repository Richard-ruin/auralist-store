// src/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q');
  const { brandSlug, categorySlug } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let endpoint = '/products?';
        if (query) endpoint += `search=${encodeURIComponent(query)}&`;
        if (brandSlug) endpoint += `brand=${encodeURIComponent(brandSlug)}&`;
        if (categorySlug) endpoint += `category=${encodeURIComponent(categorySlug)}`;

        const response = await api.get(endpoint);
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, brandSlug, categorySlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const title = query 
    ? `Search Results for "${query}"` 
    : brandSlug 
    ? 'Brand Products' 
    : 'Category Products';

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
