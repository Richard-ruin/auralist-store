import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching from:', `${API_URL}/categories`); // Debug log
        const response = await axios.get(`${API_URL}/categories`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response:', response.data); // Debug log
        
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Unexpected data format:', response.data);
          throw new Error('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error details:', err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', err.response.data);
          setError(err.response.data.message || 'Server error occurred');
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response received from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(err.message || 'An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Product Categories</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Discover our curated selection of products across various categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
              key={category._id}
              to={`/categories/${category.slug}`}
              className="group block"
              >
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-w-16 aspect-h-9">
                    {category.image ? (
                      <img
                        src={`${API_URL}/images/categories/${category.image}`}
                        alt={category.name}
                        className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAyNEgwVjBoMjR2MjR6TTEyIDIxYy01LjUyMyAwLTEwLTQuNDc3LTEwLTEwUzYuNDc3IDEgMTIgMXMxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHptMC0xOGMtNC40MTEgMC04IDMuNTg5LTggOHMzLjU4OSA4IDggOCA4LTMuNTg5IDgtOC0zLjU4OS04LTgtOHoiLz48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-100">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {category.status === 'Inactive' && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 text-xs font-semibold text-white bg-black rounded-full">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {category.productCount || 0} Products
                      </span>
                      <span className="inline-flex items-center text-sm font-medium text-black group-hover:underline">
                        Explore
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No categories available
            </h3>
            <p className="mt-2 text-gray-500">
              Please check back later for our product categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;