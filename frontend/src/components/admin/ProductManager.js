import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit, Trash2, MoreVertical,
  Filter, Download, ChevronDown, X, Check,
  AlertCircle, ChevronLeft, ChevronRight, Package // tambahkan Package di sini
} from 'lucide-react';
import ProductModal from './ProductModal';
import { toast } from 'react-hot-toast';
import api from '../../services/api';


const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 10
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
      limit: 10
    });
  };

  // Existing fetch functions...
  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      setCategories(categoriesRes.data.data);
      setBrands(brandsRes.data.data);
    } catch (error) {
      toast.error('Failed to load filter data');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFiltersData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const getStatusBadgeClass = (stock) => {
    if (stock > 10) return 'bg-green-100 text-green-800';
    if (stock > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const activeFiltersCount = Object.values(filters).filter(
    value => value && value !== 1 && value !== 10
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your product inventory and details
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
            />
          </div>

          {/* Filter Section */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="w-5 h-5 mr-2" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            {/* Enhanced Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200 animate-fadeIn">
                <div className="p-4 space-y-4">
                  {/* Filter Components */}
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Filter */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Brand</label>
  <select
    value={filters.brand}
    onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value, page: 1 }))}
    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
  >
    <option value="">All Brands</option>
    {brands.map((brand) => (
      <option key={brand._id} value={brand._id}>
        {brand.name}
      </option>
    ))}
  </select>
</div>


                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value, page: 1 }))}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value, page: 1 }))}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      setSelectedProducts(e.target.checked ? products.map(p => p._id) : []);
                    }}
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="w-12 h-12 mb-2" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr 
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => {
                          setSelectedProducts(prev => {
                            if (prev.includes(product._id)) {
                              return prev.filter(id => id !== product._id);
                            }
                            return [...prev, product._id];
                          });
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex -space-x-2 overflow-hidden">
                          {product.images?.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={`${process.env.REACT_APP_API_URL}/images/products/${image}`}
                              alt={`${product.name} ${index + 1}`}
                              className={`
                                inline-block h-10 w-10 rounded-full border-2 border-white object-cover
                                transform transition-transform duration-200 hover:scale-110
                                ${index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10'}
                              `}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40';
                              }}
                            />
                          ))}
                        </div>
                        <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${product.price?.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.discountPrice && (
                          <span className="line-through">${product.discountPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          product.stock > 10 ? 'bg-green-400' :
                          product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="text-sm text-gray-500">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-3 py-1 text-xs font-medium rounded-full
                        ${getStatusBadgeClass(product.stock)}
                        transition-all duration-200
                      `}>
                        {product.stock > 10 ? 'In Stock' : 
                         product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowModal(true);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <button 
                            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
              className="rounded-lg border-gray-300 text-sm"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {products.length} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
              disabled={filters.page === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {filters.page}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Delete Product</h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSave={() => {
            fetchProducts();
            setShowModal(false);
            setSelectedProduct(null);
            toast.success(selectedProduct ? 'Product updated successfully' : 'Product added successfully');
          }}
        />
      )}
    </div>
  );
};

export default ProductManager;