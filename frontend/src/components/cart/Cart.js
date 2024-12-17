// src/components/cart/Cart.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import { Button } from '../ui/button';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, clearCart } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        {cart?.items.length > 0 && (
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-sm"
          >
            Clear Cart
          </Button>
        )}
      </div>

      {cart?.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span>{cart.totalItems}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={loading}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Your cart is empty
          </h3>
          <p className="mt-1 text-gray-500">
            Start shopping to add items to your cart
          </p>
          <Button
            className="mt-6"
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;