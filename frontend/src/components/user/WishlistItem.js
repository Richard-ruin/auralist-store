// src/components/user/WishlistItem.js
import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useWishlist } from '../../hooks/useWishlist';
import { Badge } from '../ui/badge';

const WishlistItem = ({ item }) => {
  const navigate = useNavigate();
  const { removeFromWishlist } = useWishlist();

  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/400/320';
    
    if (image.startsWith('http')) return image;
    
    return `${process.env.REACT_APP_API_URL}/images/products/${image}`;
  };

  const handleCardClick = () => {
    navigate(`/product/${item._id || item.id}`);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    await removeFromWishlist(item._id || item.id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    toast.info('Cart functionality coming soon');
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="aspect-w-1 aspect-h-1 bg-gray-200">
        <img
          src={getImageUrl(item.mainImage || item.image)}
          alt={item.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/api/placeholder/400/320';
          }}
        />
      </div>
      
      <div className="p-4">
        {/* Brand */}
        {item.brand && (
          <p className="text-sm text-gray-500">
            {typeof item.brand === 'object' ? item.brand.name : item.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className="mt-1 font-medium text-gray-900 line-clamp-1">{item.name}</h3>

        {/* Price */}
        <p className="mt-1 text-lg font-semibold text-gray-900">
          ${(item.price || 0).toFixed(2)}
        </p>
        
        {/* Stock Status */}
        <div className="mt-2">
          {item.inStock ? (
            <Badge variant="success">In Stock</Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!item.inStock}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium 
              ${item.inStock
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
          
          <button
            onClick={handleRemove}
            className="p-2 rounded-md border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;