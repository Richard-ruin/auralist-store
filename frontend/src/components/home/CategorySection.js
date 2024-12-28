import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CategorySection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        let categoryData;
        if (response.data && response.data.data) {
          categoryData = response.data.data;
        } else if (Array.isArray(response.data)) {
          categoryData = response.data;
        } else {
          throw new Error('Invalid data format received from server');
        }

        // Only take active categories and limit to 6 for the home page
        const activeCategories = categoryData
          .filter(cat => cat.status === 'Active')
          .slice(0, 6);

        setCategories(activeCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64 text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Shop by Category
          </h3>
          <button 
            onClick={() => navigate('/categories')}
            className="text-sm text-gray-600 hover:text-black transition-colors duration-300"
          >
            View All Categories →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
            key={category._id}
            onClick={() => navigate(`/categories/${category.slug}`)}  // Updated navigation
            className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl"
          >
              {category.image ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    backgroundImage: `url(${API_URL}/images/categories/${category.image})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 opacity-60 group-hover:opacity-70 transition-opacity" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                <h4 className="text-xl font-bold mb-2 text-center">
                  {category.name}
                </h4>
                <p className="text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {category.description}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="inline-flex items-center text-sm font-medium border border-white/50 rounded-full px-4 py-1 hover:bg-white/10 transition-colors">
                    Explore Category
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;