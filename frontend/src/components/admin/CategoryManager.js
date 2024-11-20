import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';

const CategoryManager = () => {
  const [categories] = useState([
    {
      id: 1,
      name: 'Headphones',
      description: 'Premium audio headphones and earbuds',
      slug: 'headphones',
      productCount: 24,
      image: '/images/categories/headphones.jpg',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Speakers',
      description: 'High-quality speakers and sound systems',
      slug: 'speakers',
      productCount: 18,
      image: '/images/categories/speakers.jpg',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Amplifiers',
      description: 'Professional audio amplifiers',
      slug: 'amplifiers',
      productCount: 12,
      image: '/images/categories/amplifiers.jpg',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Accessories',
      description: 'Audio accessories and cables',
      slug: 'accessories',
      productCount: 45,
      image: '/images/categories/accessories.jpg',
      status: 'Inactive'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product categories and subcategories
          </p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(category.status)}`}>
                  {category.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {category.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.productCount} products
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-gray-100"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;