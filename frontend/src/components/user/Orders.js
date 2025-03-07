import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Clock, RefreshCcw, Check, X, ExternalLink, ImageIcon, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import returnService from '../../services/returnService';
import ReturnRequestForm from '../order/ReturnRequestForm';
import ReturnShippingForm from '../order/ReturnShippingForm';

// Component sudah ada sebelumnya di Orders.js
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

// Accept Dialog Component
const AcceptDeliveryDialog = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-indigo-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Delivery Acceptance
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-gray-600">
              Please ensure that the product condition is appropriate and in good condition. 
              Once you accept the delivery, you can only return items within 14 days if they meet our return policy criteria.
            </p>
            
            <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                By accepting this delivery, you confirm that:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1 list-disc pl-5">
                <li>You have received all items in your order</li>
                <li>The outer packaging is in good condition</li>
                <li>You have inspected the contents and they appear as expected</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Delivery
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [processingAccept, setProcessingAccept] = useState(false);
  const [orderForAccept, setOrderForAccept] = useState(null);
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
      console.log('Fetched orders:', data);
      
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
    console.log('Opening return request form for order:', order._id);
    setSelectedOrder(order);
    setShowReturnForm(true);
  };

  const handleReturnShipping = (order) => {
    console.log('Opening return shipping form for order:', order._id);
    setSelectedOrder(order);
    setShowShippingForm(true);
  };

  const handleAcceptDelivery = async () => {
    if (!orderForAccept) {
      console.error('No order selected for acceptance');
      return;
    }
    
    console.log('Accepting delivery for order:', orderForAccept._id);
    setProcessingAccept(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderForAccept._id}/accept-delivery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept delivery');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Delivery accepted successfully');
        setShowAcceptDialog(false);
        setOrderForAccept(null);
        fetchOrders(); // Refresh orders list
      } else {
        throw new Error(data.message || 'Failed to accept delivery');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error(error.message || 'Failed to accept delivery');
    } finally {
      setProcessingAccept(false);
    }
  };

  const handleReturnSubmit = async (formData) => {
    try {
      await returnService.submitReturn(selectedOrder._id, formData);
      toast.success('Return request submitted successfully');
      setShowReturnForm(false);
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Return submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  // Helper function to get status display name
  const getStatusDisplayName = (status) => {
    if (!status) return 'Unknown';
    
    const statusMap = {
      'processing': 'Processing',
      'confirmed': 'Confirmed',
      'being_packed': 'Being Packed',
      'managed_by_expedition': 'With Expedition',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'accepted': 'Accepted',
      'cancelled': 'Cancelled',
      'return_requested': 'Return Requested',
      'return_approved': 'Return Approved',
      'return_shipped': 'Return Shipped',
      'return_received': 'Return Received',
      'return_rejected': 'Return Rejected',
      'returned': 'Returned'
    };
    
    return statusMap[status.toLowerCase()] || status;
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'being_packed':
      case 'managed_by_expedition':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'return_requested':
        return 'bg-orange-100 text-orange-800';
      case 'return_approved':
        return 'bg-purple-100 text-purple-800';
      case 'return_shipped':
        return 'bg-blue-100 text-blue-800';
      case 'return_received':
      case 'returned':
        return 'bg-teal-100 text-teal-800';
      case 'return_rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <Clock className="w-4 h-4" />;

    switch (status.toLowerCase()) {
      case 'accepted':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
      case 'confirmed':
      case 'being_packed':
        return <RefreshCcw className="w-4 h-4" />;
      case 'managed_by_expedition':
      case 'shipped':
      case 'return_shipped':
        return <Truck className="w-4 h-4" />;
      case 'cancelled':
      case 'return_rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderOrderActions = (order) => {
    console.log('renderOrderActions for order status:', order.status);
    
    if (order.status === 'delivered') {
      return (
        <div className="mt-4">
          <button
            onClick={() => {
              console.log('Accept button clicked for order:', order._id);
              setOrderForAccept(order);
              setShowAcceptDialog(true);
            }}
            className="w-full flex justify-center items-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept Delivery
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Please verify your order is correct before accepting
          </p>
        </div>
      );
    }
    
    if (order.status === 'accepted') {
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

    if (order.status === 'return_approved') {
      return (
        <div className="mt-4">
          <button
            onClick={() => handleReturnShipping(order)}
            className="w-full flex justify-center items-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            <Truck className="w-4 h-4 mr-2" />
            Add Return Shipping Information
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
    return order.status?.toLowerCase() === filterStatus.toLowerCase();
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
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="being_packed">Being Packed</option>
            <option value="managed_by_expedition">With Expedition</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="accepted">Accepted</option>
            <option value="return_requested">Return Requested</option>
            <option value="return_approved">Return Approved</option>
            <option value="return_shipped">Return Shipped</option>
            <option value="return_received">Return Received</option>
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
                : `No ${getStatusDisplayName(filterStatus)} orders found.`}
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
                      <span className="ml-1">{getStatusDisplayName(order.status)}</span>
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
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16">
                          <ProductImage 
                            image={item.product?.images?.[0]} 
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
                            {order.shippingAddress.zipCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expedition Info */}
                  {order.expedition && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Expedition Information</h4>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">
                          <p><span className="font-medium">Service:</span> {order.expedition.service}</p>
                          <p>
                            <span className="font-medium">Tracking:</span>{' '}
                            <a 
                              href={`https://www.google.com/search?q=${order.expedition.service}+tracking+${order.expedition.trackingNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {order.expedition.trackingNumber}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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

      {/* Return Shipping Form Modal */}
      {showShippingForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ReturnShippingForm
              orderId={selectedOrder._id}
              onSuccess={() => {
                setShowShippingForm(false);
                setSelectedOrder(null);
                fetchOrders();
              }}
              onCancel={() => {
                setShowShippingForm(false);
                setSelectedOrder(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Accept Delivery Dialog */}
      <AcceptDeliveryDialog
        isOpen={showAcceptDialog}
        onClose={() => {
          console.log('Closing accept dialog');
          setShowAcceptDialog(false);
          setOrderForAccept(null);
        }}
        onConfirm={handleAcceptDelivery}
        loading={processingAccept}
      />
    </div>
  );
};

export default Orders;