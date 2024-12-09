// components/payment/OrderSummary.js
import React from 'react';
import { formatters } from '../../utils/formatters';

const OrderSummary = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
        <p className="mt-1 text-sm text-gray-500">Order ID: #{order.orderNumber}</p>
      </div>

      {/* Items List */}
      <div className="p-6 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex space-x-4">
            <div className="flex-shrink-0 w-20 h-20">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {formatters.currency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatters.currency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">{formatters.currency(order.shipping)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">-{formatters.currency(order.discount)}</span>
          </div>
        )}
        {order.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatters.currency(order.tax)}</span>
          </div>
        )}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-base font-medium text-gray-900">
              {formatters.currency(order.total)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            (Includes tax and shipping fees)
          </p>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping Information</h3>
        <address className="text-sm text-gray-600 not-italic">
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p className="mt-2">
            Phone: {formatters.phoneNumber(order.shippingAddress.phone)}
          </p>
        </address>
      </div>
    </div>
  );
};

export default OrderSummary;