// components/admin/ProductModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ProductModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    brand: '',
    category: '',
    status: 'In Stock',
    images: null,
    lowStockThreshold: '10'
  });

  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [categorySpecs, setCategorySpecs] = useState([]);
  const [specValues, setSpecValues] = useState({});

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          api.get('/brands'),
          api.get('/categories')
        ]);
        setBrands(brandsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        toast.error('Failed to load brands and categories');
      }
    };
    fetchData();
  }, []);

  // Initialize form data when editing
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
        images: null,
        lowStockThreshold: product.lowStockThreshold || '10'
      });
      setCurrentImages(product.images || []);

      // Set initial spec values if editing
      if (product.specifications) {
        const specMap = {};
        product.specifications.forEach(spec => {
          specMap[spec.specification._id] = spec.value;
        });
        setSpecValues(specMap);
      }
    }
  }, [product]);

  // Fetch specifications when category changes
  useEffect(() => {
    const fetchSpecs = async () => {
      if (formData.category) {
        try {
          const response = await api.get(`/specifications/category/${formData.category}`);
          setCategorySpecs(response.data.data);
        } catch (error) {
          toast.error('Failed to load specifications');
        }
      }
    };

    if (formData.category) {
      fetchSpecs();
    }
  }, [formData.category]);

  


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price || 
          !formData.costPrice || !formData.stock || !formData.brand || 
          !formData.category) {
        toast.error('Please fill all required fields');
        return;
      }
  
      // Validate at least one image for new products
      if (!product && (!formData.images || !formData.images.length)) {
        toast.error('Please select at least one image');
        return;
      }
  
      const formDataToSend = new FormData();
  
      // Append basic form data
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      // Handle images
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach(file => {
          formDataToSend.append('images', file);
        });
      } else if (product && currentImages && currentImages.length > 0) {
        // If editing and using existing images
        formDataToSend.append('currentImages', JSON.stringify(currentImages));
      } else if (!product) {
        // New product must have images
        toast.error('Please select at least one image');
        return;
      }
  
      // Handle specifications
      if (Object.keys(specValues).length > 0) {
        const specs = Object.entries(specValues)
          .filter(([_, value]) => value !== '') // Remove empty values
          .map(([specId, value]) => ({
            specification: specId,
            value: value.toString() // Ensure value is string
          }));
        
        if (specs.length > 0) {
          formDataToSend.append('specifications', JSON.stringify(specs));
        }
      }
  
      console.log('Submitting data:', {
        images: formData.images,
        currentImages,
        specifications: specValues
      });
  
      let response;
      if (product) {
        response = await api.patch(`/products/${product._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        response = await api.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }
  
      // Panggil onClose dengan parameter true untuk memicu refresh
      onClose(true);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  // Update image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
  
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Only JPG, PNG and WebP images are allowed');
      return;
    }
  
    // Validate file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error('Images must be less than 5MB');
      return;
    }
  
    setFormData(prev => ({ ...prev, images: files }));
      
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => {
      prev.forEach(URL.revokeObjectURL);
      return previews;
    });
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewImages.forEach(URL.revokeObjectURL);
    };
  }, [previewImages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-md p-2"
              rows="3"
              required
            />
          </div>

          {/* Pricing and Stock */}
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

          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                className="w-full border rounded-md p-2"
                min="1"
                required
              />
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
          </div>

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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Images (Max 5)
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full border rounded-md p-2"
              multiple
              accept="image/*"
              required={!product}
            />
            {/* Image Previews */}
            {(previewImages.length > 0 || currentImages.length > 0) && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {previewImages.length > 0 ? 
                  previewImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))
                  :
                  currentImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${process.env.REACT_APP_API_URL}/images/products/${image}`}
                        alt={`Current ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Specifications */}
{categorySpecs.length > 0 && (
  <div>
    <h3 className="text-lg font-medium mb-4">Specifications</h3>
    <div className="grid grid-cols-2 gap-4">
      {categorySpecs.map((spec) => (
        <div key={spec._id}>
          <label className="block text-sm font-medium mb-1">
            {spec.displayName}
            {spec.isRequired && <span className="text-red-500">*</span>}
          </label>

          {spec.type === 'varchar' ? (
            <input
              type="text"
              value={specValues[spec._id] || ''}
              onChange={(e) => setSpecValues({
                ...specValues,
                [spec._id]: e.target.value
              })}
              className="w-full border rounded-md p-2"
              required={spec.isRequired}
              placeholder={`Enter ${spec.displayName}`}
            />
          ) : spec.type === 'select' ? (
            <select
              value={specValues[spec._id] || ''}
              onChange={(e) => setSpecValues({
                ...specValues,
                [spec._id]: e.target.value
              })}
              className="w-full border rounded-md p-2"
              required={spec.isRequired}
            >
              <option value="">Select {spec.displayName}</option>
              {spec.options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          ) : spec.type === 'boolean' ? (
            <select
              value={specValues[spec._id] || ''}
              onChange={(e) => setSpecValues({
                ...specValues,
                [spec._id]: e.target.value === 'true'
              })}
              className="w-full border rounded-md p-2"
              required={spec.isRequired}
            >
              <option value="">Select {spec.displayName}</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : spec.type === 'number' ? (
            <div className="flex items-center">
              <input
                type="number"
                value={specValues[spec._id] || ''}
                onChange={(e) => setSpecValues({
                  ...specValues,
                  [spec._id]: e.target.value
                })}
                className="w-full border rounded-md p-2"
                required={spec.isRequired}
                placeholder={`Enter ${spec.displayName}`}
              />
              {spec.unit && (
                <span className="ml-2 text-gray-500">{spec.unit}</span>
              )}
            </div>
          ) : (
            // For text type
            <textarea
              value={specValues[spec._id] || ''}
              onChange={(e) => setSpecValues({
                ...specValues,
                [spec._id]: e.target.value
              })}
              className="w-full border rounded-md p-2"
              required={spec.isRequired}
              placeholder={`Enter ${spec.displayName}`}
              rows="3"
            />
          )}
          
          {spec.unit && spec.type !== 'number' && (
            <span className="text-sm text-gray-500 mt-1">
              Unit: {spec.unit}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
)}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default ProductModal;
