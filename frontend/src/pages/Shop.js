// pages/Shop.js
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { Filter, Search } from 'lucide-react';
import api from '../services/api';

const ShopPage = () => {
  const navigate = useNavigate();
  const { brandSlug, categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentBrand, setCurrentBrand] = useState('');
  const [filters, setFilters] = useState({
    search: searchQuery || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories and brands first
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);
        setCategories(categoriesRes.data.data);
        setBrands(brandsRes.data.data);

        // Set initial category and brand based on URL
        if (categorySlug) {
          const category = categoriesRes.data.data.find(c => c.slug === categorySlug);
          if (category) setCurrentCategory(category._id);
        }
        if (brandSlug) {
          const brand = brandsRes.data.data.find(b => b.slug === brandSlug);
          if (brand) setCurrentBrand(brand._id);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, [categorySlug, brandSlug]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = '/products?';
        const queryParams = new URLSearchParams();

        if (currentCategory) {
          queryParams.append('category', currentCategory);
        }
        if (currentBrand) {
          queryParams.append('brand', currentBrand);
        }
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        const paramString = queryParams.toString();
        const finalEndpoint = paramString ? `${endpoint}${paramString}` : endpoint;

        const response = await api.get(finalEndpoint);
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentBrand, searchQuery]);

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      const category = categories.find(c => c._id === value);
      if (category) {
        setCurrentCategory(value);
        if (currentBrand) {
          // Maintain brand filter while changing category
          const brand = brands.find(b => b._id === currentBrand);
          navigate(`/categories/${category.slug}`);
        } else {
          navigate(value ? `/categories/${category.slug}` : '/shop');
        }
      } else {
        setCurrentCategory('');
        navigate('/shop');
      }
    } else if (key === 'brand') {
      const brand = brands.find(b => b._id === value);
      if (brand) {
        setCurrentBrand(value);
        if (currentCategory) {
          // Maintain category filter while changing brand
          const category = categories.find(c => c._id === currentCategory);
          navigate(`/brands/${brand.slug}`);
        } else {
          navigate(value ? `/brands/${brand.slug}` : '/shop');
        }
      } else {
        setCurrentBrand('');
        navigate('/shop');
      }
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const filteredProducts = products.filter((product) => {
    let matches = true;

    if (filters.minPrice) {
      matches = matches && product.price >= parseFloat(filters.minPrice);
    }
    if (filters.maxPrice) {
      matches = matches && product.price <= parseFloat(filters.maxPrice);
    }

    return matches;
  });

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 container mx-auto px-4 py-8">
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
        <div className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-categories"
                    name="category"
                    checked={!currentCategory}
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
                      checked={currentCategory === category._id}
                      onChange={() => handleFilterChange('category', category._id)}
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
                    checked={!currentBrand}
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
                      checked={currentBrand === brand._id}
                      onChange={() => handleFilterChange('brand', brand._id)}
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
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/4">
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