import React from 'react';
import { Heart, ShoppingCart, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Button } from '../ui/button';
import StarRating from '../ui/StarRating';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems = [], addToWishlist, removeFromWishlist } = useWishlist();

  const isProductInWishlist = Array.isArray(wishlistItems) ? 
    wishlistItems.some(item => (item.id === product._id || item._id === product._id)) : false;

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      if (isProductInWishlist) {
        await removeFromWishlist(product._id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product._id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login as a customer to use wishlist');
        navigate('/login', { 
          state: { 
            returnUrl: `/product/${product._id}`,
            message: 'Please login as a customer to use wishlist' 
          }
        });
      } else {
        toast.error('Failed to update wishlist');
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;

    try {
      const success = await addToCart(product._id, 1);
      if (success) {
        toast.success('Added to cart');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login as a customer to add items to cart');
        navigate('/login', { 
          state: { 
            returnUrl: `/product/${product._id}`,
            message: 'Please login as a customer to add items to cart' 
          }
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300 cursor-pointer"
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
              e.target.src = '/api/placeholder/300/300';
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
        <Button
          onClick={handleWishlistClick}
          variant={isProductInWishlist ? "destructive" : "secondary"}
          size="icon"
          className="absolute top-2 right-2 rounded-full"
        >
          <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-current' : ''}`} />
        </Button>
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

        {/* Rating Section - Replacing Specifications */}
        <div className="flex items-center space-x-2 mb-3">
          <StarRating rating={product.averageRating || 0} size="sm" />
          <span className="text-sm text-gray-500">
            ({product.totalReviews || 0} reviews)
          </span>
        </div>

        {/* Price and Action Section */}
        <div className="flex justify-between items-center">
          <div>
            {product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through mr-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

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
      </div>
    </div>
  );
};

export default ProductCard;