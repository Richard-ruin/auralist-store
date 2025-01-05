import React from 'react';
import { useParams } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';

const OrderSummary = ({ orderData }) => {
  const { orderId } = useParams();
  
  if (!orderData) return null;

  const formatCurrency = (amount, curr = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `${curr} ${amount.toFixed(2)}`;
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/400/320';
    if (image.startsWith('http')) return image;
    return `${process.env.REACT_APP_API_URL}/api/images/products/${image}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
        <p className="mt-1 text-sm text-gray-500">
          Order ID: #{orderId?.slice(-8).toUpperCase() || 'N/A'}
        </p>
      </div>

      {/* Items List */}
      <div className="p-6 space-y-4">
        {orderData.items?.map((item, index) => (
          <div key={index} className="flex space-x-4">
            <div className="flex-shrink-0 w-20 h-20">
              <img
                src={getImageUrl(item.product?.mainImage)}
                alt={item.product?.name || item.name || 'Product'}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/400/320';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.product?.name || item.name || 'Product Name'}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">
            {formatCurrency(orderData.totalAmount)}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-base font-medium text-gray-900">
              {formatCurrency(orderData.totalAmount)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            (Including all applicable taxes and fees)
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;