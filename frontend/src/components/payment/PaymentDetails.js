import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ShippingAddressSelector from './ShippingAddressSelector';
import CountdownTimer from './CountdownTimer';
import PaymentMethodDetails from './PaymentMethodDetails';

const PaymentDetails = ({
  orderId,
  paymentMethod,
  amount,
  currency,
  onBack,
  onNext
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }
    onNext(selectedAddressId);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to payment methods
      </button>

      {/* Timer */}
      <div className="mb-6">
        <CountdownTimer minutes={5} onExpire={() => onBack()} />
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Shipping Address Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Select Shipping Address
          </h3>
          <ShippingAddressSelector
            selectedAddressId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Payment Details Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Details
          </h3>
          <PaymentMethodDetails
            paymentMethod={paymentMethod}
            amount={amount}
            currency={currency}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            Change payment method
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;