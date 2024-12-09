// components/payment/PaymentStatus.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatters } from '../../utils/formatters';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Payment Pending',
    description: 'Your payment is being processed'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Payment Successful',
    description: 'Your payment has been processed successfully'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Payment Failed',
    description: 'There was an issue processing your payment'
  },
  processing: {
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Payment Processing',
    description: 'Your payment is being verified'
  }
};

const PaymentStatus = ({ payment, order }) => {
  const config = statusConfig[payment.status];
  const StatusIcon = config.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Status Card */}
      <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6`}>
        <div className="flex items-center">
          <StatusIcon className={`h-8 w-8 ${config.color}`} />
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{config.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        {payment.status === 'failed' && payment.errorMessage && (
          <div className="mt-4 p-3 bg-red-100 rounded-md">
            <p className="text-sm text-red-700">{payment.errorMessage}</p>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Transaction ID</dt>
            <dd className="text-sm font-medium text-gray-900">{payment.transactionId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Payment Method</dt>
            <dd className="text-sm font-medium text-gray-900">
              {payment.method === 'credit_card' 
                ? `${payment.cardInfo?.brand?.toUpperCase()} ending in ${payment.cardInfo?.last4}`
                : 'Bank Transfer'
              }
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Amount</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatters.currency(payment.amount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Date</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatters.date(payment.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Next Steps</h3>
        
        <Link 
          to={`/orders/${order._id}`}
          className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">View Order Details</p>
              <p className="text-sm text-gray-500">Track your order status and delivery</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <Link 
          to="/shop"
          className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Continue Shopping</p>
              <p className="text-sm text-gray-500">Browse more products</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Additional Information */}
      {payment.status === 'completed' && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h4>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>You will receive a payment confirmation email</li>
            <li>The order will be processed and shipped soon</li>
            <li>You can track your order status in the orders page</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;