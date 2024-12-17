// components/product/WishlistButton.js
import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlistAction';
import { toast } from 'react-hot-toast';

const WishlistButton = ({ productId, className = '' }) => {
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const isInWishlist = wishlistItems.some(item => item.id === productId);

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`p-2 rounded-full transition-colors ${
        isInWishlist 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-gray-500'
      } ${className}`}
    >
      <Heart
        className="w-6 h-6"
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </button>
  );
};

export default WishlistButton;