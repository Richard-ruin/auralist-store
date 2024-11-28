// components/admin/ProductModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ProductModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    brand: '',
    category: '',
    status: 'In Stock',
    sku: '',
    lowStockThreshold: '10',
    images: null
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  // Generate SKU
  useEffect(() => {
    if (!product) {
      setFormData(prev => ({
        ...prev,
        sku: `PRD${Date.now()}`
      }));
    }
  }, [product]);

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          api.get('/brands'),
          api.get('/categories')
        ]);
        
        setBrands(brandsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load brands and categories');
      }
    };

    fetchData();
  }, []);

  // Initialize form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        costPrice: product.costPrice || '',
        stock: product.stock || '',
        brand: product.brand?._id || '',
        category: product.category?._id || '',
        status: product.status || 'In Stock',
        sku: product.sku || '',
        lowStockThreshold: product.lowStockThreshold || '10',
        images: null
      });
    }
  }, [product]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setFormData(prev => ({ ...prev, images: files }));
      
      // Create previews
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => {
        // Clean up old preview URLs
        prev.forEach(url => URL.revokeObjectURL(url));
        return previews;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          data.append(key, formData[key]);
        }
      });

      // Append images
      if (formData.images) {
        Array.from(formData.images).forEach(file => {
          data.append('images', file);
        });
      }

      if (product) {
        await api.patch(`/products/${product._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                readOnly
                className="w-full border rounded-md p-2 bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-md p-2"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border rounded-md p-2"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                className="w-full border rounded-md p-2"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full border rounded-md p-2"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                className="w-full border rounded-md p-2"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full border rounded-md p-2"
              multiple
              accept="image/*"
              required={!product}
            />
            <p className="mt-1 text-sm text-gray-500">Maximum 5 images allowed</p>

            {previewImages.length > 0 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {previewImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
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