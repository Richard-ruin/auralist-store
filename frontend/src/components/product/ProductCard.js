// components/product/ProductCard.js
import React from 'react';
import { Heart, ShoppingCart, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Add to cart logic here
    toast.success('Added to cart');
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    // Add to wishlist logic here
    toast.success('Added to wishlist');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative aspect-w-1 aspect-h-1">
        {product.mainImage ? (
          <img
            src={`${process.env.REACT_APP_API_URL}/images/products/${product.mainImage}`}
            alt={product.name}
            className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Multiple Images Indicator */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            +{product.images.length - 1}
          </div>
        )}

        {/* Stock Status Badge */}
        {product.stock <= product.lowStockThreshold && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium
            ${product.stock === 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'}`}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
        >
          <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-sm text-gray-500 mb-1">{product.brand?.name}</p>
        
        {/* Product Name */}
        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h4>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-3">
          Category: {product.category?.name}
        </p>

        {/* Price and Action Section */}
        <div className="flex justify-between items-center">
          <div>
            {/* Compare Price */}
            {product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through mr-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {/* Current Price */}
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-full ${
              product.stock === 0
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-indigo-50 hover:bg-indigo-100'
            } transition-colors`}
          >
            <ShoppingCart className={`w-5 h-5 ${
              product.stock === 0 ? 'text-gray-400' : 'text-indigo-600'
            }`} />
          </button>
        </div>

        {/* Specs Preview */}
        {product.specifications?.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              {product.specifications.slice(0, 2).map((spec) => (
                <div key={spec.specification._id} className="text-xs text-gray-600">
                  <span className="font-medium">{spec.specification.displayName}:</span>{' '}
                  {spec.value}
                  {spec.specification.unit && ` ${spec.specification.unit}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;