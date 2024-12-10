import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeft, ClipboardCheck, Clock } from 'lucide-react';
import CopyButton from './CopyButton';
import CountdownTimer from './CountdownTimer';

// Predefined bank accounts
const bankAccounts = {
  visa: {
    name: "Auralist Store",
    number: "4532 0159 8744 6321"
  },
  mastercard: {
    name: "Auralist Store",
    number: "5412 7534 9821 0063"
  },
  bri: {
    name: "Auralist Store",
    number: "0123 0124 5678 901"
  },
  bca: {
    name: "Auralist Store",
    number: "8736 4521 9087"
  },
  mandiri: {
    name: "Auralist Store",
    number: "1270 0012 3456 789"
  }
};

const PaymentDetails = ({ 
  orderId, 
  paymentMethod, 
  amount = 0,
  currency = 'USD',
  onBack, 
  onNext 
}) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [copyStatus, setCopyStatus] = useState({
    account: false,
    amount: false
  });

  // Get bank account details based on payment method
  const bankAccount = bankAccounts[paymentMethod];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Error state if no bank account found
  if (!bankAccount) {
    return (
      <div className="text-center p-4">
        <p>Invalid payment method selected. Please go back and select a valid payment method.</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to payment methods
        </button>
      </div>
    );
  }

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
        <div className="flex items-center justify-center bg-orange-50 rounded-lg p-4 border border-orange-200">
          <Clock className="w-5 h-5 text-orange-500 mr-2" />
          <span className="text-orange-700 font-medium mr-2">
            Complete payment within:
          </span>
          <span className="font-mono text-lg font-bold text-orange-700">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Payment Details for Order #{orderId.slice(-8).toUpperCase()}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please transfer the exact amount to the account below
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bank Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {bankAccount.name}
            </div>
          </div>

          {/* Bank Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-lg font-medium">
                {bankAccount.number}
              </div>
              <CopyButton 
                text={bankAccount.number} 
                onCopy={() => handleCopy(bankAccount.number, 'account')}
                isCopied={copyStatus.account}
              />
            </div>
          </div>

          {/* Transfer Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Amount
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-lg font-medium">
                {formatAmount(amount)}
              </div>
              <CopyButton 
                text={amount.toString()} 
                onCopy={() => handleCopy(amount.toString(), 'amount')}
                isCopied={copyStatus.amount}
              />
            </div>
            <p className="mt-2 text-sm text-red-600">
              Please transfer the exact amount to help us verify your payment faster
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              Change payment method
            </button>
            <button
              onClick={onNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                transition-colors"
            >
              I have completed the payment
            </button>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Important Notes:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Transfer must be completed within the time limit</li>
          <li>• Make sure to transfer the exact amount shown</li>
          <li>• Keep your payment proof for verification</li>
          <li>• For Bank Transfer, use account number provided above</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentDetails;