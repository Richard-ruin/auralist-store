// components/product/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  ArrowLeft, 
  Plus, 
  Minus,
  Loader
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (error) {
        toast.error('Failed to load product details');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={`${process.env.REACT_APP_API_URL}/images/products/${product.images[selectedImage]}`}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}/images/products/${image}`}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/100x100?text=Thumbnail';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{product.brand?.name}</p>
            <p className="text-sm text-gray-500">Category: {product.category?.name}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline space-x-4">
              <p className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </p>
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-xl text-gray-500 line-through">
                  ${product.comparePrice.toFixed(2)}
                </p>
              )}
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <p className="text-sm text-green-600 mt-1">
                Save ${(product.comparePrice - product.price).toFixed(2)} ({Math.round((1 - product.price/product.comparePrice) * 100)}% off)
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${product.stock > product.lowStockThreshold
                ? 'bg-green-100 text-green-800'
                : product.stock > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
              }`}
            >
              {product.status}
              <span className="ml-2 text-xs">
                ({product.stock} available)
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {product.specifications.map((spec) => (
                  <div key={spec.specification._id} className="border-b border-gray-200 pb-2">
                    <p className="text-sm text-gray-600">{spec.specification.displayName}</p>
                    <p className="font-medium">
                      {spec.value}
                      {spec.specification.unit && ` ${spec.specification.unit}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping & Warranty Info */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center text-gray-600">
              <Truck className="w-5 h-5 mr-2" />
              <span>Free shipping on orders over $500</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 mr-2" />
              <span>2-year warranty included</span>
            </div>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 text-center border-x px-2 py-1"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center
                ${product.stock === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'} 
                text-white`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${product.inWishlist ? 'fill-current text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;