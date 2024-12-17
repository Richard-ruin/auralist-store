// src/components/cart/CartItem.js
import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/button';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart, loading } = useCart();

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity === 0) {
      await removeFromCart(item.product._id);
    } else if (newQuantity <= item.product.stock) {
      await updateCartItem(item.product._id, newQuantity);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/400/320';
    if (image.startsWith('http')) return image;
    return `${process.env.REACT_APP_API_URL}/images/products/${image}`;
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-24">
        <img
          src={getImageUrl(item.product.mainImage)}
          alt={item.product.name}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/api/placeholder/400/320';
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">
          {item.product.name}
        </h3>
        {item.product.brand && (
          <p className="text-sm text-gray-500">
            {item.product.brand.name}
          </p>
        )}
        <p className="text-lg font-semibold text-gray-900 mt-1">
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          disabled={loading || item.quantity <= 1}
          onClick={() => handleQuantityChange(item.quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="w-12 text-center">{item.quantity}</span>

        <Button
          variant="outline"
          size="icon"
          disabled={loading || item.quantity >= item.product.stock}
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="text-red-500 hover:text-red-600"
          disabled={loading}
          onClick={() => removeFromCart(item.product._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;