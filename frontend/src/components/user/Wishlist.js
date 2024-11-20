import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, AlertCircle } from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'HD 660S',
      brand: 'Sennheiser',
      price: 499.99,
      image: '/images/products/hd660s.jpg',
      inStock: true
    },
    {
      id: 2,
      name: 'KEF LS50 Meta',
      brand: 'KEF',
      price: 1499.99,
      image: '/images/products/kef-ls50.jpg',
      inStock: true
    },
    {
      id: 3,
      name: 'Cambridge CXA81',
      brand: 'Cambridge Audio',
      price: 1299.99,
      image: '/images/products/cambridge-cxa81.jpg',
      inStock: false
    }
  ]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });
      if (response.ok) {
        // Optionally remove from wishlist after adding to cart
        removeFromWishlist(productId);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500">{item.brand}</p>
                <h3 className="mt-1 font-medium text-gray-900">{item.name}</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </p>
                
                {/* Stock Status */}
                <div className="mt-2">
                  {item.inStock ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => addToCart(item.id)}
                    disabled={!item.inStock}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium ${
                      item.inStock
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 border border-gray-300 rounded-md text-gray-400 hover:text-red-500 hover:border-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Wishlist is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Save items you love to your wishlist
          </p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;