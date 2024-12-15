// components/user/Wishlist/WishlistCard.js
import React from 'react';
import { ImageIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useWishlist } from '../../hooks/useWishlistAction';

const WishlistCard = ({ product }) => {
  const navigate = useNavigate();
  const { removeFromWishlist } = useWishlist();

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleRemoveFromWishlist = async (e) => {
    e.stopPropagation();
    try {
      await removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
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
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
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

        {/* Stock Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium
          ${product.stock === 0 
            ? 'bg-red-100 text-red-800' 
            : product.stock <= product.lowStockThreshold
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {product.stock === 0 
            ? 'Out of Stock' 
            : product.stock <= product.lowStockThreshold
              ? 'Low Stock'
              : 'In Stock'
          }
        </div>

        {/* Remove from Wishlist Button */}
        <button
          onClick={handleRemoveFromWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 group"
        >
          <Trash2 className="w-5 h-5 text-gray-700 group-hover:text-red-500" />
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

        {/* Price Section */}
        <div className="flex items-center space-x-2">
          {/* Compare Price */}
          {product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
          {/* Current Price */}
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
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

export default WishlistCard;