import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeft, ClipboardCheck, Clock } from 'lucide-react';

const PaymentDetails = ({ bankAccount, amount, currency, onBack, onNext }) => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [copyStatus, setCopyStatus] = useState({
    account: false,
    amount: false
  });

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

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
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
            Payment Details
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
              <button
                onClick={() => handleCopy(bankAccount.number, 'account')}
                className="flex items-center justify-center h-12 w-12 rounded-lg border border-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                title="Copy account number"
              >
                {copyStatus.account ? (
                  <ClipboardCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Amount
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-lg font-medium">
                {formatAmount(amount, currency)}
              </div>
              <button
                onClick={() => handleCopy(amount.toString(), 'amount')}
                className="flex items-center justify-center h-12 w-12 rounded-lg border border-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                title="Copy amount"
              >
                {copyStatus.amount ? (
                  <ClipboardCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-red-600">
              Please transfer the exact amount to help us verify your payment faster
            </p>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Important Notes:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Transfer must be completed within the time limit</li>
              <li>• Make sure to transfer the exact amount shown</li>
              <li>• Keep your payment proof for verification</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              I have completed the payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;