// src/components/admin/ProductModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ProductModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    status: 'Active',
    images: null
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch brands and categories
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          api.get('/brands'),
          api.get('/categories')
        ]);
        setBrands(brandsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        toast.error('Failed to load brands and categories');
      }
    };

    fetchOptions();
  }, []);

  // Initialize form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        brand: product.brand?._id || '',
        category: product.category?._id || '',
        status: product.status || 'Active',
        images: null
      });
      // Set current images if editing
      setCurrentImages(
        product.images?.map(img => `${process.env.REACT_APP_API_URL}${img}`) || []
      );
    }
  }, [product]);

  // Handle image change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files); // Debugging
  
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: files
      }));
  
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const data = new FormData();
  
      // Append basic data
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('brand', formData.brand);
      data.append('category', formData.category);
      data.append('status', formData.status);
  
      // Handle images
      if (formData.images && formData.images.length > 0) {
        // Clear append images
        for (let i = 0; i < formData.images.length; i++) {
          data.append('images', formData.images[i]);
        }
      }
  
      // Log FormData contents (for debugging)
      for (let [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      // Send request
      if (product) {
        await api.patch(`/products/${product._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product created successfully');
      }
  
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
  <label className="block text-sm font-medium mb-1">Images</label>
  <input
    type="file"
    name="images"
    multiple
    onChange={handleImageChange}
    className="w-full border rounded-md p-2"
    accept="image/*"
    required={!product} // Required only for new products
  />
  <p className="mt-1 text-sm text-gray-500">
    Select multiple images (max 5)
  </p>
</div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={loading}
            >
              {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;