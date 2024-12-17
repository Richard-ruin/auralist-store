import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BrandSection = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API_URL}/brands`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        let brandData;
        if (response.data && response.data.data) {
          brandData = response.data.data;
        } else if (Array.isArray(response.data)) {
          brandData = response.data;
        } else {
          throw new Error('Invalid data format received from server');
        }

        // Only take active brands and limit to 6 for the home page
        const activeBrands = brandData
          .filter(brand => brand.status === 'Active')
          .slice(0, 6);

        setBrands(activeBrands);
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(err.message || 'Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-40 text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Featured Brands
          </h3>
          <button 
            onClick={() => navigate('/brands')}
            className="text-sm text-gray-600 hover:text-black transition-colors duration-300"
          >
            View All Brands →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand._id}
              onClick={() => navigate(`/shop?brand=${brand.slug}`)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex">
                {/* Brand Logo Section */}
                <div className="w-1/3 relative bg-gray-50 p-4">
                  {brand.logo ? (
                    <img
                      src={`${API_URL}/images/brands/${brand.logo}`}
                      alt={brand.name}
                      className="w-full h-24 object-contain transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAyNEgwVjBoMjR2MjR6TTEyIDIxYy01LjUyMyAwLTEwLTQuNDc3LTEwLTEwUzYuNDc3IDEgMTIgMXMxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHptMC0xOGMtNC40MTEgMC04IDMuNTg5LTggOHMzLjU4OSA4IDggOCA4LTMuNTg5IDgtOC0zLjU4OS04LTgtOHoiLz48L3N2Zz4=';
                      }}
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Brand Info Section */}
                <div className="w-2/3 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {brand.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {brand.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {brand.productCount || 0} Products
                    </span>
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-600 hover:text-black flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hover Overlay with Call-to-Action */}
              <div className="h-1 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No brands available
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Please check back later for our featured brands.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandSection;