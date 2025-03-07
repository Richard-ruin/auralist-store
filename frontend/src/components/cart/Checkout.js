import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Loader, CreditCard, Check, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import orderService from '../../services/order';
import api from '../../services/api';
import ShippingAddressSelector from '../payment/ShippingAddressSelector';
import OrderSummary from '../payment/OrderSummary';
import StatusBadge from '../payment/StatusBadge';
import PaymentMethod from '../payment/PaymentMethod';
import PaymentDetails from '../payment/PaymentDetails';
import PaymentConfirmation from '../payment/PaymentConfirmation';
import PaymentWaiting from '../payment/PaymentWaiting';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [error, setError] = useState(null);
  
  // Checkout flow steps
  const [currentStep, setCurrentStep] = useState('checkout');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Fetch user addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get('/addresses');
        setAddresses(response.data.data);
        
        // If there's a default address, select it
        const defaultAddress = response.data.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (response.data.data.length > 0) {
          setSelectedAddressId(response.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setError('Failed to load your shipping addresses');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchAddresses();
  }, []);

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
  };

  // Handle checkout/place order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessingOrder(true);
    setError(null);

    try {
      // Prepare order data from cart items
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: selectedAddressId,
        totalAmount: cart.totalAmount
      };

      // Create the order
      const response = await orderService.createOrder(orderData);
      const createdOrderId = response.data.data.order._id;
      
      // Set order ID for next steps
      setOrderId(createdOrderId);
      
      // Move to payment method selection
      setCurrentStep('payment-method');
      
      // We'll clear cart only after successful payment
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.message || 'Failed to create order. Please try again.');
      toast.error('Failed to create order');
    } finally {
      setProcessingOrder(false);
    }
  };
  
  // Handle payment method selection
  const handleSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment-details');
  };
  
  // Move to payment confirmation step
  const handleContinueToConfirmation = () => {
    setCurrentStep('payment-confirmation');
  };
  
  // Handle payment submission success
  const handlePaymentSuccess = async () => {
    // Clear the cart after successful payment submission
    await clearCart();
    setCurrentStep('payment-waiting');
  };
  
  // Handle back navigation between steps
  const handleBackToMethod = () => {
    setCurrentStep('payment-method');
  };
  
  const handleBackToDetails = () => {
    setCurrentStep('payment-details');
  };
  
  const handleBackToOrders = () => {
    navigate('/user/orders');
  };

  if (cartLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading checkout information...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Render different steps based on current step
  const renderStep = () => {
    // Step 1: Initial checkout (selecting address)
    if (currentStep === 'checkout') {
      return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Cart
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Shipping Address Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <ShippingAddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onAddressSelect={handleAddressSelect}
                />
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h2>
                
                <div className="space-y-4">
                  <div className="relative border border-gray-200 rounded-lg p-4 flex items-start">
                    <div className="h-5 w-5 flex items-center justify-center mr-3 mt-0.5">
                      <div className="h-4 w-4 bg-indigo-600 rounded-full">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Standard Shipping</h3>
                      <p className="text-sm text-gray-500 mt-1">Delivery in 3-5 business days</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">Free</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Payment Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>You'll be able to select your payment method in the next step after placing your order.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase Benefits</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Truck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Free Shipping</h3>
                      <p className="text-sm text-gray-500">On orders over $500</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">2-Year Warranty</h3>
                      <p className="text-sm text-gray-500">On all our products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.product._id} className="flex items-center">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.product.mainImage ? `${process.env.REACT_APP_API_URL}/images/products/${item.product.mainImage}` : '/api/placeholder/400/320'} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/api/placeholder/400/320';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                            <p className="text-sm font-medium text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">${cart.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">Shipping</span>
                      <span className="text-sm font-medium text-gray-900">Free</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">Tax</span>
                      <span className="text-sm font-medium text-gray-900">Included</span>
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">${cart.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processingOrder || !selectedAddressId}
                    className={`mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white
                      ${processingOrder || !selectedAddressId 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                  >
                    {processingOrder ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 2: Select payment method
    else if (currentStep === 'payment-method') {
      return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Method</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PaymentMethod
                  selectedMethod={selectedPaymentMethod}
                  onSelect={handleSelectPaymentMethod}
                  orderId={orderId}
                />
              </div>
              
              <div className="lg:col-span-1">
                <OrderSummary orderData={{
                  items: cart.items.map(item => ({
                    product: {
                      _id: item.product._id,
                      name: item.product.name,
                      mainImage: item.product.mainImage,
                      price: item.product.price
                    },
                    quantity: item.quantity,
                    price: item.product.price
                  })),
                  totalAmount: cart.totalAmount
                }} />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 3: Payment details
    else if (currentStep === 'payment-details') {
      return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Details</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PaymentDetails
                  orderId={orderId}
                  paymentMethod={selectedPaymentMethod}
                  amount={cart.totalAmount}
                  currency="USD"
                  onBack={handleBackToMethod}
                  onNext={handleContinueToConfirmation}
                />
              </div>
              
              <div className="lg:col-span-1">
                <OrderSummary orderData={{
                  items: cart.items.map(item => ({
                    product: {
                      _id: item.product._id,
                      name: item.product.name,
                      mainImage: item.product.mainImage,
                      price: item.product.price
                    },
                    quantity: item.quantity,
                    price: item.product.price
                  })),
                  totalAmount: cart.totalAmount
                }} />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 4: Payment confirmation
    else if (currentStep === 'payment-confirmation') {
      return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Confirm Payment</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PaymentConfirmation
                  orderId={orderId}
                  paymentMethod={selectedPaymentMethod}
                  onBack={handleBackToDetails}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
              
              <div className="lg:col-span-1">
                <OrderSummary orderData={{
                  items: cart.items.map(item => ({
                    product: {
                      _id: item.product._id,
                      name: item.product.name,
                      mainImage: item.product.mainImage,
                      price: item.product.price
                    },
                    quantity: item.quantity,
                    price: item.product.price
                  })),
                  totalAmount: cart.totalAmount
                }} />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 5: Payment waiting
    else if (currentStep === 'payment-waiting') {
      return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Status</h1>
            
            <PaymentWaiting
              orderId={orderId}
              onBack={handleBackToOrders}
            />
          </div>
        </div>
      );
    }
  };

  return renderStep();
};

export default Checkout;