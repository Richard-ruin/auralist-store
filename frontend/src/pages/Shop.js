// pages/Shop.js
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import { Filter, Search } from 'lucide-react';
import api from '../services/api';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/brands'),
        ]);

        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
        setBrands(brandsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredProducts = products.filter((product) => {
    let matches = true;

    if (filters.search) {
      matches =
        matches &&
        product.name.toLowerCase().includes(filters.search.toLowerCase());
    }

    if (filters.category) {
      matches = matches && product.category._id === filters.category;
    }

    if (filters.brand) {
      matches = matches && product.brand._id === filters.brand;
    }

    if (filters.minPrice) {
      matches = matches && product.price >= parseFloat(filters.minPrice);
    }

    if (filters.maxPrice) {
      matches = matches && product.price <= parseFloat(filters.maxPrice);
    }

    return matches;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sort) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 container mx-auto px-4 py-8">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div
          className={`lg:w-1/4 ${
            showMobileFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Search */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-categories"
                    name="category"
                    checked={filters.category === ''}
                    onChange={() => handleFilterChange('category', '')}
                    className="mr-2"
                  />
                  <label htmlFor="all-categories">All Categories</label>
                </div>
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center">
                    <input
                      type="radio"
                      id={category._id}
                      name="category"
                      checked={filters.category === category._id}
                      onChange={() =>
                        handleFilterChange('category', category._id)
                      }
                      className="mr-2"
                    />
                    <label htmlFor={category._id}>{category.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Brands</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-brands"
                    name="brand"
                    checked={filters.brand === ''}
                    onChange={() => handleFilterChange('brand', '')}
                    className="mr-2"
                  />
                  <label htmlFor="all-brands">All Brands</label>
                </div>
                {brands.map((brand) => (
                  <div key={brand._id} className="flex items-center">
                    <input
                      type="radio"
                      id={brand._id}
                      name="brand"
                      checked={filters.brand === brand._id}
                      onChange={() =>
                        handleFilterChange('brand', brand._id)
                      }
                      className="mr-2"
                    />
                    <label htmlFor={brand._id}>{brand.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange('minPrice', e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange('maxPrice', e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Sort Options */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">{sortedProducts.length} Products</p>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
