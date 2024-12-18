import React from 'react';
import { CreditCard, Building2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/order';

const PaymentMethod = ({ selectedMethod, onSelect, onNext, orderId }) => {
  // Predefined bank accounts with consistent naming
  const bankAccounts = {
    visa: {
      name: "Auralist Store",
      number: "4532 0159 8744 6321",
      logo: "/bank-logos/visa.png"
    },
    mastercard: {
      name: "Auralist Store",
      number: "5412 7534 9821 0063",
      logo: "/bank-logos/mastercard.png"
    },
    bri: {
      name: "Auralist Store",
      number: "0123 0124 5678 901",
      logo: "/bank-logos/bri.png"
    },
    bca: {
      name: "Auralist Store",
      number: "8736 4521 9087",
      logo: "/bank-logos/bca.png"
    },
    mandiri: {
      name: "Auralist Store",
      number: "1270 0012 3456 789",
      logo: "/bank-logos/mandiri.png"
    }
  };

  const handleMethodSelect = async (methodId) => {
    try {
      // Update order dengan payment method yang dipilih
      await orderService.updateOrder(orderId, {
        paymentMethod: methodId
      });
      
      onSelect(methodId);
    } catch (error) {
      toast.error('Failed to update payment method');
    }
  };
  // Payment method categories with icons
  const paymentCategories = [
    {
      type: 'international',
      title: 'International Banking',
      description: 'Pay with Visa or Mastercard',
      icon: CreditCard,
      methods: [
        { id: 'visa', name: 'Visa', ...bankAccounts.visa },
        { id: 'mastercard', name: 'Mastercard', ...bankAccounts.mastercard }
      ]
    },
    {
      type: 'local',
      title: 'Local Banking',
      description: 'Pay with Indonesian Banks',
      icon: Building2,
      methods: [
        { id: 'bri', name: 'Bank BRI', ...bankAccounts.bri },
        { id: 'bca', name: 'Bank BCA', ...bankAccounts.bca },
        { id: 'mandiri', name: 'Bank Mandiri', ...bankAccounts.mandiri }
      ]
    }
  ];

  // Default image error handler
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/120x40?text=Bank+Logo';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Select Payment Method
      </h2>

      <div className="space-y-6">
        {paymentCategories.map((category) => (
          <div 
            key={category.type} 
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Category Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <category.icon className="h-5 w-5 text-indigo-600" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {category.methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`relative rounded-lg border p-4 flex items-center 
                    transition-all duration-200 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-indigo-500
                    ${selectedMethod === method.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                >
                  {/* Bank Logo */}
                  <div className="flex-shrink-0 h-12 w-20 flex items-center justify-center">
                    <img
                      src={method.logo}
                      alt={method.name}
                      onError={handleImageError}
                      className="h-8 w-auto object-contain"
                    />
                  </div>

                  {/* Bank Name */}
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {method.name}
                    </div>
                    {selectedMethod === method.id && (
                      <div className="text-xs text-indigo-600 mt-1">
                        Selected
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {selectedMethod === method.id && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-indigo-600 
                      rounded-full flex items-center justify-center shadow-sm">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={onNext}
          disabled={!selectedMethod}
          className={`flex items-center px-6 py-2 rounded-lg font-medium
            transition-colors duration-200
            ${selectedMethod
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          Continue to Payment
          <svg 
            className="ml-2 h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>

      {/* Information Box */}
      {selectedMethod && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Payment Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You have selected {bankAccounts[selectedMethod]?.name}. You will be provided with the account details in the next step.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;