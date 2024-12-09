import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, ArrowRight, Home } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import { useNavigate } from 'react-router-dom';

const PaymentWaiting = ({ orderId }) => {
  const { getPaymentStatus } = usePayment();
  const [status, setStatus] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await getPaymentStatus(orderId);
        setStatus(result.status);

        // If payment is confirmed, stop polling
        if (result.status === 'confirmed') {
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [orderId, getPaymentStatus]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Status Icon */}
        <div className="px-6 py-8 flex flex-col items-center">
          {status === 'confirmed' ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          )}

          {/* Status Message */}
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            {status === 'confirmed' 
              ? 'Payment Confirmed!' 
              : 'Waiting for Confirmation'}
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            {status === 'confirmed'
              ? 'Your payment has been confirmed. Thank you for your purchase!'
              : 'We are reviewing your payment. This usually takes 5-10 minutes during business hours.'}
          </p>
        </div>

        {/* Order Details */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-2">
              <span>Order ID:</span>
              <span className="font-medium text-gray-900">
                #{orderId.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            {status === 'confirmed' ? (
              <>
                <button
                  onClick={() => navigate('/orders')}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Order Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                  <Home className="w-4 h-4 ml-2" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="animate-pulse flex items-center space-x-2 text-yellow-600 mb-4">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your payment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Info */}
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-200 rounded-b-lg">
          <p className="text-sm text-blue-800 text-center">
            Having issues? Contact our support at support@auralist.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentWaiting;