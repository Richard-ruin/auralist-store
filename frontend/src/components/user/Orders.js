import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Clock, RefreshCcw, Check, X } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      date: '2024-03-20',
      total: 499.99,
      status: 'delivered',
      items: [
        {
          id: 1,
          name: 'HD 660S',
          price: 499.99,
          quantity: 1,
          image: '/images/products/hd660s.jpg'
        }
      ],
      tracking: 'JNE123456789',
      address: {
        street: '123 Main St',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        zipCode: '12345'
      }
    },
    {
      id: 'ORD-002',
      date: '2024-03-19',
      total: 1499.99,
      status: 'processing',
      items: [
        {
          id: 2,
          name: 'KEF LS50 Meta',
          price: 1499.99,
          quantity: 1,
          image: '/images/products/kef-ls50.jpg'
        }
      ],
      tracking: 'JNE987654321',
      address: {
        street: '456 Park Ave',
        city: 'Surabaya',
        state: 'East Java',
        zipCode: '67890'
      }
    }
  ]);

  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <Check className="w-4 h-4" />;
      case 'processing':
        return <RefreshCcw className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
        <div className="flex items-center space-x-2">
          <select 
            className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Order Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order {order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {expandedOrders[order.id] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Details */}
            {expandedOrders[order.id] && (
              <div className="px-6 py-4">
                {/* Order Items */}
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-16 h-16">
                        <img
                          src={item.image || 'https://via.placeholder.com/64'}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900">Shipping Information</h4>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                  </div>
                  {order.tracking && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Tracking Number: <span className="font-medium">{order.tracking}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-4">
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">
                    Track Order
                  </button>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">
                    View Invoice
                  </button>
                  {order.status === 'delivered' && (
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;