// components/payment/CreditCard.js
import React, { useState } from 'react';
import { CreditCard as CardIcon, Lock } from 'lucide-react';
import paymentService from '../../services/payment';
import { toast } from 'react-hot-toast';

const CreditCard = ({ order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
      if (formatted.length <= 19) { // 16 digits + 3 spaces
        setCardDetails(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    if (name === 'cvv') {
      if (value.length <= 3 && /^\d*$/.test(value)) {
        setCardDetails(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'expiryMonth') {
      const monthValue = parseInt(value);
      if (!value || (monthValue >= 1 && monthValue <= 12)) {
        setCardDetails(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'expiryYear') {
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
      const yearValue = parseInt(value);
      if (!value || (yearValue >= currentYear && yearValue <= currentYear + 10)) {
        setCardDetails(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateCard = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const cardYear = parseInt(cardDetails.expiryYear);
    const cardMonth = parseInt(cardDetails.expiryMonth);

    if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
      toast.error('Card has expired');
      return false;
    }

    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Invalid card number');
      return false;
    }

    if (cardDetails.cvv.length !== 3) {
      toast.error('Invalid CVV');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCard()) return;

    setLoading(true);
    try {
      await paymentService.processCreditCard(order._id, cardDetails);
      toast.success('Payment processed successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-yellow-900 mb-2">Test Card Numbers</h3>
        <div className="space-y-1 text-sm text-yellow-800">
          <p>Visa: 4242 4242 4242 4242</p>
          <p>Mastercard: 5555 5555 5555 4444</p>
          <p>American Express: 3782 822463 10005</p>
          <p>Discover: 6011 1111 1111 1117</p>
          <p className="mt-2 text-yellow-700">Use any future expiry date and any 3 digits for CVV</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
        <div className="relative">
          <input
            type="text"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <CardIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
        <input
          type="text"
          name="cardName"
          value={cardDetails.cardName}
          onChange={handleInputChange}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="expiryMonth"
              value={cardDetails.expiryMonth}
              onChange={handleInputChange}
              placeholder="MM"
              maxLength="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              name="expiryYear"
              value={cardDetails.expiryYear}
              onChange={handleInputChange}
              placeholder="YY"
              maxLength="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
          <div className="relative">
            <input
              type="text"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              placeholder="123"
              maxLength="3"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Processing...' : `Pay ${order.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`}
      </button>
    </form>
  );
};

export default CreditCard;