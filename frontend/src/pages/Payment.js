import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader, ChevronLeft } from 'lucide-react';
import orderService from '../services/order';

// Import komponen-komponen payment
import PaymentMethod from '../components/payment/PaymentMethod';
import PaymentDetails from '../components/payment/PaymentDetails';
import PaymentConfirmation from '../components/payment/PaymentConfirmation';
import PaymentWaiting from '../components/payment/PaymentWaiting';
import OrderSummary from '../components/payment/OrderSummary';
import StatusBadge from '../components/payment/StatusBadge';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
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
    const fetchData = async () => {
      try {
        let data;
        if (location.state?.order) {
          console.log('Using location state order:', location.state.order);
          data = location.state.order;
        } else {
          const response = await orderService.getOrder(orderId);
          console.log('Fetched order data:', response.data);
          data = response.data.data;
        }
  
        // Transform dan validasi data
        const transformedData = {
          ...data,
          items: data.items?.map(item => ({
            product: {
              _id: item.product._id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price
            },
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
          })) || [],
          totalAmount: Number(data.totalAmount) || 0,
          currency: data.currency || 'USD'
        };
  
        console.log('Transformed order data:', transformedData);
        setOrderData(transformedData);
  
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [orderId, location.state]);

  const renderStepContent = () => {
    switch (step) {
      case 'method':
        return (
          <PaymentMethod
            paymentMethods={paymentMethods}
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
            onNext={() => setStep('details')}
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
            onNext={() => setStep('confirmation')} // Disederhanakan
          />
        );
      case 'confirmation':
        return (
          <PaymentConfirmation
            orderId={orderId}
            paymentMethod={selectedMethod}
            onBack={() => setStep('details')}
            onSuccess={() => setStep('waiting')}
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Payment
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Order data not found'}</p>
          <button
            onClick={() => navigate('/user/orders')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to Orders
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
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Complete Your Payment
              </h1>
              <p className="text-gray-600 mt-1">
                Order #{orderId.slice(-8).toUpperCase()}
              </p>
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

export default Payment;