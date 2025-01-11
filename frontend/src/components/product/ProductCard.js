import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Button } from '../ui/button';
import StarRating from '../ui/StarRating';
import reviewService from '../../services/reviewService';

const ProductCard = ({ product: initialProduct }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems = [], addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);

  const isProductInWishlist = Array.isArray(wishlistItems) ? 
    wishlistItems.some(item => (item.id === product._id || item._id === product._id)) : false;

  useEffect(() => {
    const updateProductRating = async () => {
      try {
        const ratingData = await reviewService.getProductRating(product._id);
        setProduct(prev => ({
          ...prev,
          averageRating: ratingData.averageRating,
          totalReviews: ratingData.totalReviews
        }));
      } catch (error) {
        console.error('Error updating product rating:', error);
      }
    };

    updateProductRating();
  }, [product._id]);

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscountPercentage = () => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round((1 - product.price / product.comparePrice) * 100);
    }
    return 0;
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

        {/* Discount Badge */}
        {calculateDiscountPercentage() > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            -{calculateDiscountPercentage()}%
          </div>
        )}

        {/* Stock Status Badge */}
        {product.stock <= (product.lowStockThreshold || 10) && (
          <div className={`absolute ${calculateDiscountPercentage() > 0 ? 'top-10' : 'top-2'} left-2 px-2 py-1 rounded-full text-xs font-medium
            ${product.stock === 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'}`}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
          </div>
        )}

        {/* Multiple Images Indicator */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            +{product.images.length - 1}
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          onClick={handleWishlistClick}
          variant={isProductInWishlist ? "destructive" : "secondary"}
          size="icon"
          className="absolute top-2 right-2 rounded-full"
          disabled={isLoading}
        >
          <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Brand */}
        {product.brand?.name && (
          <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>
        )}
        
        {/* Product Name */}
        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h4>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating Section */}
        <div className="flex items-center space-x-2 mb-3">
          <StarRating rating={product.averageRating || 0} size="sm" />
          <span className="text-sm text-gray-500">
            {product.averageRating ? product.averageRating.toFixed(1) : '0'} 
            ({product.totalReviews || 0})
          </span>
        </div>

        {/* Price and Action Section */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
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