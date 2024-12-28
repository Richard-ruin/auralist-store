import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader, ChevronLeft } from 'lucide-react';
import orderService from '../../services/order';
import { useCart } from '../../hooks/useCart';
import api from '../../services/api';

// Import payment components
import PaymentMethod from '../payment/PaymentMethod';
import PaymentDetails from '../payment/PaymentDetails';
import PaymentConfirmation from '../payment/PaymentConfirmation';
import PaymentWaiting from '../payment/PaymentWaiting';
import OrderSummary from '../payment/OrderSummary';
import StatusBadge from '../payment/StatusBadge';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState('method');
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Payment method options
  const paymentMethods = [
    {
      type: 'international',
      title: 'International Banking',
      description: 'Pay with Visa or Mastercard',
      methods: [
        { id: 'visa', name: 'Visa', logo: '/visa.png' },
        { id: 'mastercard', name: 'Mastercard', logo: '/mastercard.png' }
      ]
    },
    {
      type: 'local',
      title: 'Local Banking',
      description: 'Pay with Indonesian Banks',
      methods: [
        { id: 'bri', name: 'BRI', logo: '/bri.png' },
        { id: 'bca', name: 'BCA', logo: '/bca.png' },
        { id: 'mandiri', name: 'Mandiri', logo: '/mandiri.png' }
      ]
    }
  ];

  useEffect(() => {
    const initializeCheckout = async () => {
      if (!cartLoading && (!cart || cart.items.length === 0)) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }

      if (cart) {
        try {
          setLoading(true);
          
          // Check for default address first
          let defaultAddress;
          try {
            const addressResponse = await api.get('/addresses/default');
            defaultAddress = addressResponse.data.data;
          } catch (error) {
            if (error.response?.status === 404) {
              toast.error('Please set a default shipping address first');
              navigate('/user/address-book');
              return;
            }
            throw error;
          }

          // Create initial order with shipping address
          const initialOrderData = {
            items: cart.items.map(item => ({
              product: item.product._id,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress: defaultAddress._id,
            totalAmount: cart.totalAmount
          };

          const response = await orderService.createOrder(initialOrderData);
          setOrderId(response.data.data.order._id);

          // Transform cart data for display
          const transformedData = {
            ...response.data.data.order,
            items: cart.items.map(item => ({
              product: {
                _id: item.product._id,
                name: item.product.name,
                image: item.product.mainImage,
                price: item.product.price
              },
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0,
              total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
            })),
            totalAmount: Number(cart.totalAmount) || 0,
            currency: 'USD'
          };

          setOrderData(transformedData);
        } catch (error) {
          console.error('Error initializing checkout:', error);
          setError(error.message);
          toast.error('Failed to initialize checkout');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeCheckout();
  }, [cart, cartLoading, navigate]);

  const handlePaymentMethodSelect = async (method) => {
    try {
      setLoading(true);
      setSelectedMethod(method);

      await orderService.updateOrder(orderId, {
        paymentMethod: method
      });

      setStep('details');
    } catch (error) {
      console.error('Error selecting payment method:', error);
      toast.error('Failed to process payment method');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentDetailsNext = async () => {
    setStep('confirmation');
  };

  const handleConfirmationSuccess = async () => {
    try {
      await clearCart();
      setStep('waiting');
    } catch (error) {
      toast.error('Failed to process payment confirmation');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'method':
        return (
          <PaymentMethod
            paymentMethods={paymentMethods}
            selectedMethod={selectedMethod}
            onSelect={handlePaymentMethodSelect}
            onNext={() => {}} // Handled by handlePaymentMethodSelect
            orderId={orderId}
          />
        );
      case 'details':
        return (
          <PaymentDetails
            orderId={orderId}
            paymentMethod={selectedMethod}
            amount={orderData.totalAmount}
            currency={orderData.currency}
            onBack={() => setStep('method')}
            onNext={handlePaymentDetailsNext}
          />
        );
      case 'confirmation':
        return (
          <PaymentConfirmation
            orderId={orderId}
            paymentMethod={selectedMethod}
            onBack={() => setStep('details')}
            onSuccess={handleConfirmationSuccess}
          />
        );
      case 'waiting':
        return (
          <PaymentWaiting
            orderId={orderId}
            onBack={() => navigate('/user/orders')}
          />
        );
      default:
        return null;
    }
  };

  if (cartLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-gray-600">Processing checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Processing Checkout
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Cart data not found'}</p>
          <button
            onClick={() => navigate('/cart')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Cart
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Complete Your Payment
              </h1>
              {orderId && (
                <p className="text-gray-600 mt-1">
                  Order #{orderId.slice(-8).toUpperCase()}
                </p>
              )}
            </div>
            <StatusBadge status={orderData.status} />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Payment Method', 'Payment Details', 'Confirmation', 'Waiting'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${['method', 'details', 'confirmation', 'waiting'].indexOf(step) >= i 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-600'}`}
                >
                  {i + 1}
                </div>
                <div className="hidden sm:block">
                  <span className={`ml-2 text-sm font-medium
                    ${['method', 'details', 'confirmation', 'waiting'].indexOf(step) >= i 
                      ? 'text-indigo-600' 
                      : 'text-gray-500'}`}
                  >
                    {s}
                  </span>
                </div>
                {i < 3 && (
                  <div className="w-12 sm:w-24 h-1 mx-2 bg-gray-200">
                    <div 
                      className={`h-full bg-indigo-600 transition-all duration-300
                        ${['method', 'details', 'confirmation', 'waiting'].indexOf(step) > i 
                          ? 'w-full' 
                          : 'w-0'}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Order Summary */}
        {step !== 'waiting' && (
          <OrderSummary orderData={orderData} />
        )}
      </div>
    </div>
  );
};

export default Checkout;