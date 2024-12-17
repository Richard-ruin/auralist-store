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
  Loader,
  CreditCard,
  ShoppingBag 
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import orderService from '../../services/order';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [buyLoading, setBuyLoading] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
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

  

  const handleAddToCart = async () => {
    try {
      const success = await addToCart(product._id, quantity);
      if (success) {
        toast.success('Added to cart');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        navigate('/login', { 
          state: { 
            returnUrl: `/product/${id}`,
            message: 'Please login to add items to cart' 
          }
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };
  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product, isInWishlist]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        navigate('/login', { 
          state: { 
            returnUrl: `/product/${id}`,
            message: 'Please login to add items to wishlist' 
          }
        });
      } else {
        toast.error('Failed to update wishlist');
      }
    }
  };

  const handleBuyNow = async () => {
    try {
      setBuyLoading(true);
      
      // Get default address
      let defaultAddress;
      try {
        const addressResponse = await api.get('/addresses/default');
        defaultAddress = addressResponse.data.data;
        console.log('Got default address:', defaultAddress);
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error('Please set a default shipping address first');
          navigate('/user/address-book');
          return;
        }
        throw error;
      }
  
      // Prepare order data
      const orderData = {
        items: [{
          product: product._id,
          quantity: Number(quantity),
          price: Number(product.price)
        }],
        shippingAddress: defaultAddress._id, // Send just the ID
        paymentMethod: 'pending',
        totalAmount: Number(product.price * quantity)
      };
  
      console.log('Sending order data:', orderData);
  
      const response = await orderService.createOrder(orderData);
      console.log('Order created:', response.data);
  
      // Navigate to payment page
      navigate(`/user/payment/${response.data.data.order._id}`, {
        state: {
          order: {
            ...response.data.data.order,
            items: [{
              product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.mainImage || (product.images && product.images[0])
              },
              quantity: quantity,
              price: product.price
            }]
          }
        }
      });
  
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error);
      toast.error(
        error.response?.data?.message || 
        'Failed to process order. Please try again.'
      );
    } finally {
      setBuyLoading(false);
    }
  };
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x400?text=Product+Image';
    
    if (image.startsWith('http')) return image;
    
    return `${process.env.REACT_APP_API_URL}/images/products/${image}`;
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
        onClick={() => navigate('/shop')}
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
              src={getImageUrl(product.images?.[selectedImage] || product.mainImage)}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
              }}
            />
          </div>
          {Array.isArray(product.images) && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-sm transition-all
                    ${selectedImage === index 
                      ? 'ring-2 ring-indigo-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1'
                    }`}
                >
                  <img
                    src={getImageUrl(image)}
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
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.brand && (
              <p className="text-lg text-gray-600 mt-1">{product.brand.name}</p>
            )}
            {product.category && (
              <p className="text-sm text-gray-500">Category: {product.category.name}</p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline space-x-4">
              <p className="text-3xl font-bold text-gray-900">
                ${product.price?.toFixed(2)}
              </p>
              {product.comparePrice > 0 && (
                <p className="text-xl text-gray-500 line-through">
                  ${product.comparePrice?.toFixed(2)}
                </p>
              )}
            </div>
            {product.comparePrice > product.price && (
              <p className="text-sm text-green-600 mt-1">
                Save ${(product.comparePrice - product.price).toFixed(2)} 
                ({Math.round((1 - product.price/product.comparePrice) * 100)}% off)
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${product.stock > (product.lowStockThreshold || 10)
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
                  <div key={spec.specification?._id || spec._id} className="border-b border-gray-200 pb-2">
                    <p className="text-sm text-gray-600">
                      {spec.specification?.displayName || spec.name}
                    </p>
                    <p className="font-medium">
                      {spec.value}
                      {spec.specification?.unit && ` ${spec.specification.unit}`}
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
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
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
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
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
              onClick={handleBuyNow}
              disabled={product.stock === 0 || buyLoading}
              className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center
                ${product.stock === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : buyLoading
                  ? 'bg-indigo-500 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'} 
                text-white font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {buyLoading ? (
                <Loader className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              {product.stock === 0 
                ? 'Out of Stock' 
                : buyLoading 
                ? 'Processing...' 
                : 'Buy Now'}
            </button>

            <button
      onClick={handleAddToCart}
      disabled={product.stock === 0 || loading}
      className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center
        border border-indigo-600 
        ${product.stock === 0 || loading
          ? 'opacity-50 cursor-not-allowed'
          : 'text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100'} 
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    >
      <ShoppingBag className="w-5 h-5 mr-2" />
      Add to Cart
    </button>

            <button 
    onClick={handleWishlistClick}
    className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100
      transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    title="Add to Wishlist"
  >
    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-red-500' : 'text-gray-600'}`} />
  </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;