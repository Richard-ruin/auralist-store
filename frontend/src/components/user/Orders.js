// components/user/Orders.js
import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Clock, RefreshCcw, Check, X, ExternalLink, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import returnService from '../../services/returnService';
import ReturnRequestForm from '../order/ReturnRequestForm';

const ProductImage = ({ image, name }) => {
  return (
    <div className="relative w-full h-full">
      {image ? (
        <img
          src={`${process.env.REACT_APP_API_URL}/images/products/${image}`}
          alt={name}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/api/placeholder/300/300';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view your orders');
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          toast.error('Please login again');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setOrders(data.data.orders || []);
      } else {
        setOrders([]);
        toast.error(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchOrders();
    }
  }, [navigate]);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleReturnRequest = (order) => {
    setSelectedOrder(order);
    setShowReturnForm(true);
  };

  const handleReturnSubmit = async (formData) => {
    try {
      await returnService.submitReturn(selectedOrder._id, formData);
      toast.success('Return request submitted successfully');
      setShowReturnForm(false);
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'return_requested':
        return 'bg-purple-100 text-purple-800';
      case 'return_approved':
        return 'bg-green-100 text-green-800';
      case 'return_rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <Clock className="w-4 h-4" />;

    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <Check className="w-4 h-4" />;
      case 'processing':
        return <RefreshCcw className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const data = await response.json();
        console.log('Orders fetched:', data); // Debugging
        if (data.status === 'success') {
          setOrders(data.data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
  
    fetchOrders();
  }, []);

  const renderOrderActions = (order) => {
    console.log('Order in renderOrderActions:', order); // Debugging
  
    if (order.status === 'delivered') {
      return (
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-gray-600">Need to return?</span>
          <button
            onClick={() => handleReturnRequest(order)}
            className="text-indigo-600 hover:text-indigo-800 font-medium underline"
          >
            Request Return Here
          </button>
        </div>
      );
    }
  
    return null; // Untuk status lain, tidak menampilkan apapun
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
        <div className="flex items-center space-x-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="return_requested">Return Requested</option>
            <option value="return_approved">Return Approved</option>
            <option value="return_rejected">Return Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filterStatus} orders found.`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order ID: {order._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                    <button
                      onClick={() => toggleOrderExpansion(order._id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      {expandedOrders[order._id] ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              {expandedOrders[order._id] && (
                <div className="px-6 py-4">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16">
                          <ProductImage 
                            image={item.product?.images[0]} 
                            name={item.product?.name} 
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.product?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${item.price?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">Total</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900">Shipping Information</h4>
                    <div className="mt-2">
                      {order.shippingAddress && (
                        <div className="text-sm text-gray-500">
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Action */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    {renderOrderActions(order)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Return Form Modal */}
      {showReturnForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ReturnRequestForm
              orderId={selectedOrder._id}
              onSuccess={() => {
                setShowReturnForm(false);
                setSelectedOrder(null);
                fetchOrders();
              }}
              onCancel={() => {
                setShowReturnForm(false);
                setSelectedOrder(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;