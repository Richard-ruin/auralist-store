// components/admin/CategoryManager.js
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Image as ImageIcon,
  AlertCircle,
  Settings
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import CategoryModal from './CategoryModal';
import CategorySpecificationModal from './CategorySpecificationModal';
import { toast } from 'react-hot-toast';
import ItemCard from './itemcard';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      // Periksa struktur response dan pastikan data ada
      console.log('Response:', response); // Untuk debugging
      if (response && response.data) {
        setCategories(response.data);
      } else {
        setCategories([]);
        toast.error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(formData);
        toast.success('Category created successfully');
      }
      fetchCategories();
      setShowModal(false);
      setSelectedCategory(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.delete(id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category');
      }
    }
  };

  // Pastikan categories ada sebelum melakukan filter
  const filteredCategories = (categories || []).filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product categories and their specifications
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <ItemCard
              key={category._id}
              image={category.image ? `${process.env.REACT_APP_API_URL}/images/categories/${category.image}` : null}
              name={category.name}
              status={category.status}
              description={category.description}
              itemCount={category.productCount || 0}
              type="category"
              onEdit={() => {
                setSelectedCategory(category);
                setShowModal(true);
              }}
              onSettings={() => {
                setSelectedCategory(category);
                setShowSpecModal(true);
              }}
              onDelete={() => handleDelete(category._id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={selectedCategory}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setSelectedCategory(null);
          }}
        />
      )}

      {showSpecModal && selectedCategory && (
        <CategorySpecificationModal
          category={selectedCategory}
          onClose={() => {
            setShowSpecModal(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default CategoryManager;