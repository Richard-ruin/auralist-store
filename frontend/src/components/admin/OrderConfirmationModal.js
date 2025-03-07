import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ImageIcon, Truck, Package, Check, ArrowRight, Loader, MapPin, Box, XCircle } from 'lucide-react';
import api from '../../services/api';
import orderService from '../../services/order';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, onStatusUpdate, order }) => {
  const [status, setStatus] = useState('confirmed');
  const [orderStatus, setOrderStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [expeditionServices, setExpeditionServices] = useState([]);
  const [selectedExpedition, setSelectedExpedition] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loadingExpeditions, setLoadingExpeditions] = useState(false);
  const [currentAction, setCurrentAction] = useState('confirm-payment'); // confirm-payment, update-status, add-expedition

  useEffect(() => {
    if (isOpen && order) {
      setStatus('confirmed');
      setOrderStatus(order.status || 'processing');
      setNotes('');
      setImageError(false);
      setTrackingNumber(order.expedition?.trackingNumber || '');
      setSelectedExpedition(order.expedition?.service || '');
      
      // Determine current action based on order status
      if (order.status === 'processing') {
        setCurrentAction('confirm-payment');
      } else if (order.status === 'confirmed') {
        setCurrentAction('update-status');
        setOrderStatus('being_packed');
      } else if (order.status === 'being_packed') {
        setCurrentAction('add-expedition');
        setOrderStatus('managed_by_expedition');
        // Fetch expedition services
        fetchExpeditionServices();
      } else if (order.status === 'managed_by_expedition') {
        setCurrentAction('update-status');
        setOrderStatus('shipped');
      } else if (order.status === 'shipped') {
        setCurrentAction('update-status');
        setOrderStatus('delivered');
      } else if (order.status === 'return_approved') {
        setCurrentAction('update-status');
        setOrderStatus('return_received');
      } else {
        // For other statuses
        setCurrentAction('view-details');
      }
    }
  }, [isOpen, order]);

  const handleStatusUpdate = async (status, notes, expedition) => {
    try {
      console.log('Parent component - updating status:', { status, notes, expedition });
      // Make sure to pass expedition as the third parameter, not inside status
      await orderService.updateOrderStatus(order._id, status, notes, expedition);
      // Rest of your code
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      setLoading(true);
      try {
        await onStatusUpdate('cancelled', notes);
        onClose();
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchExpeditionServices = async () => {
    try {
      setLoadingExpeditions(true);
      const response = await api.get('/expedition-services');
      if (response.data.data) {
        setExpeditionServices(response.data.data);
      } else {
        // Mock data if API is not available
        setExpeditionServices([
          // International
          { _id: '1', code: 'DHL', name: 'DHL Express', type: 'international' },
          { _id: '2', code: 'FEDEX', name: 'FedEx', type: 'international' },
          { _id: '3', code: 'UPS', name: 'UPS', type: 'international' },
          // Domestic
          { _id: '4', code: 'JNE', name: 'JNE', type: 'domestic' },
          { _id: '5', code: 'TIKI', name: 'TIKI', type: 'domestic' },
          { _id: '6', code: 'POS', name: 'POS Indonesia', type: 'domestic' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching expedition services:', error);
      // Mock data if API fails
      setExpeditionServices([
        // International
        { _id: '1', code: 'DHL', name: 'DHL Express', type: 'international' },
        { _id: '2', code: 'FEDEX', name: 'FedEx', type: 'international' },
        { _id: '3', code: 'UPS', name: 'UPS', type: 'international' },
        // Domestic
        { _id: '4', code: 'JNE', name: 'JNE', type: 'domestic' },
        { _id: '5', code: 'TIKI', name: 'TIKI', type: 'domestic' },
        { _id: '6', code: 'POS', name: 'POS Indonesia', type: 'domestic' }
      ]);
    } finally {
      setLoadingExpeditions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentAction === 'confirm-payment') {
        await onConfirm(status, notes);
      } else if (currentAction === 'add-expedition') {
        if (!selectedExpedition || !trackingNumber) {
          alert('Please select an expedition service and enter a tracking number');
          setLoading(false);
          return;
        }
        
        // Create expedition object
        const expeditionData = {
          service: selectedExpedition,
          trackingNumber: trackingNumber,
          date: new Date()
        };
        
        console.log('OrderConfirmationModal - sending expedition data:', expeditionData);
        
        // Call the parent's onStatusUpdate function
        await onStatusUpdate(orderStatus, notes, expeditionData);
      } else if (currentAction === 'update-status') {
        await onStatusUpdate(orderStatus, notes);
      }
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  const paymentProofUrl = order.paymentProof
    ? `${process.env.REACT_APP_API_URL}/images/payments/${order.paymentProof}`
    : null;

  // Helper function to get status display name
  const getStatusDisplayName = (statusCode) => {
    const statusMap = {
      'processing': 'Processing',
      'confirmed': 'Confirmed',
      'being_packed': 'Being Packed',
      'managed_by_expedition': 'Managed by Expedition',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'accepted': 'Accepted by Customer',
      'cancelled': 'Cancelled',
      'return_requested': 'Return Requested',
      'return_approved': 'Return Approved',
      'return_shipped': 'Return Shipped',
      'return_received': 'Return Received',
      'return_rejected': 'Return Rejected',
      'returned': 'Returned'
    };
    return statusMap[statusCode] || statusCode;
  };

  // Get next step label based on current status
  const getNextStepLabel = () => {
    switch (order.status) {
      case 'processing':
        return 'Confirm Payment';
      case 'confirmed':
        return 'Mark as Being Packed';
      case 'being_packed':
        return 'Add Expedition Details';
      case 'managed_by_expedition':
        return 'Mark as Shipped';
      case 'shipped':
        return 'Mark as Delivered';
      case 'return_approved':
        return 'Mark as Return Received';
      default:
        return 'Update';
    }
  };

  // Get next status icon
  const getNextStepIcon = () => {
    switch (order.status) {
      case 'processing':
        return <Check className="w-5 h-5" />;
      case 'confirmed':
        return <Box className="w-5 h-5" />;
      case 'being_packed':
        return <Truck className="w-5 h-5" />;
      case 'managed_by_expedition':
        return <Truck className="w-5 h-5" />;
      case 'shipped':
        return <MapPin className="w-5 h-5" />;
      case 'return_approved':
        return <Box className="w-5 h-5" />;
      default:
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  // Check if the order can be cancelled
  // Orders can be cancelled before they are managed by expedition
  const canBeCancelled = ['processing', 'confirmed', 'being_packed'].includes(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {currentAction === 'confirm-payment' 
              ? 'Confirm Payment' 
              : currentAction === 'add-expedition'
                ? 'Add Expedition Details'
                : currentAction === 'update-status'
                  ? `Update Order to ${getStatusDisplayName(orderStatus)}`
                  : 'Order Details'
            }
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-3">
              <p className="text-sm">
                <span className="font-medium">Order ID:</span>{' '}
                <span className="font-mono">{order._id}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Amount:</span>{' '}
                ${order.totalAmount?.toFixed(2)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Payment Method:</span>{' '}
                <span className="capitalize">{order.paymentMethod}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Order Status:</span>{' '}
                <span className="capitalize">{getStatusDisplayName(order.status)}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Customer:</span>{' '}
                {order.user?.name || 'Unknown'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{' '}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Payment Proof Image (only show in payment confirmation) */}
            {currentAction === 'confirm-payment' && paymentProofUrl && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Payment Proof</h3>
                <div className="relative bg-gray-50 rounded-lg">
                  {!imageError ? (
                    <>
                      <div className="aspect-video relative">
                        <img
                          src={paymentProofUrl}
                          alt="Payment Proof"
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            console.error('Error loading payment proof image');
                            setImageError(true);
                          }}
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <a
                          href={paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          View Full Image
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Failed to load payment proof image</p>
                      <p className="text-xs text-gray-400 mt-1">{order.paymentProof}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded">
                      {item.product?.mainImage ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL}/images/products/${item.product.mainImage}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/api/placeholder/400/320';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × ${item.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.quantity * item.price)?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expedition Details Section */}
            {currentAction === 'add-expedition' && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Expedition Details</h3>
                
                {loadingExpeditions ? (
                  <div className="flex justify-center items-center p-6">
                    <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expedition Service*
                      </label>
                      <select
                        value={selectedExpedition}
                        onChange={(e) => setSelectedExpedition(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                      >
                        <option value="">Select Expedition Service</option>
                        
                        {/* International Services */}
                        <optgroup label="International Services">
                          {expeditionServices
                            .filter(service => service.type === 'international')
                            .map(service => (
                              <option key={service._id} value={service.code}>
                                {service.name}
                              </option>
                            ))
                          }
                        </optgroup>
                        
                        {/* Domestic Services */}
                        <optgroup label="Domestic Services">
                          {expeditionServices
                            .filter(service => service.type === 'domestic')
                            .map(service => (
                              <option key={service._id} value={service.code}>
                                {service.name}
                              </option>
                            ))
                          }
                        </optgroup>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number*
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                        placeholder="Enter tracking number"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shipping Address */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Shipping Address</h3>
              {order.shippingAddress ? (
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.phoneNumber}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping address information available</p>
              )}
            </div>

            {/* Expedition Info */}
            {order.expedition && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-sm font-medium mb-3 text-blue-800">Expedition Information</h3>
                <div className="text-sm text-blue-700">
                  <p>
                    <span className="font-medium">Service:</span> {order.expedition.service}
                  </p>
                  <p>
                    <span className="font-medium">Tracking Number:</span> {order.expedition.trackingNumber}
                  </p>
                  {order.expedition.date && (
                    <p>
                      <span className="font-medium">Date:</span> {new Date(order.expedition.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Order Timeline</h3>
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">Order Created</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'confirmed' || ['being_packed', 'managed_by_expedition', 'shipped', 'delivered', 'accepted'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.status === 'confirmed' || ['being_packed', 'managed_by_expedition', 'shipped', 'delivered', 'accepted'].includes(order.status) ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-gray-300"></div>}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">Payment Confirmed</div>
                    <div className="text-xs text-gray-500">
                      {order.paymentConfirmedAt ? new Date(order.paymentConfirmedAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'being_packed' || ['managed_by_expedition', 'shipped', 'delivered', 'accepted'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.status === 'being_packed' || ['managed_by_expedition', 'shipped', 'delivered', 'accepted'].includes(order.status) ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-gray-300"></div>}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">Being Packed</div>
                    <div className="text-xs text-gray-500">
                      {order.status === 'being_packed' || ['managed_by_expedition', 'shipped', 'delivered', 'accepted'].includes(order.status) ? 'In Progress' : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'managed_by_expedition' || ['shipped', 'delivered', 'accepted'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.status === 'managed_by_expedition' || ['shipped', 'delivered', 'accepted'].includes(order.status) ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-gray-300"></div>}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">With Expedition</div>
                    <div className="text-xs text-gray-500">
                      {order.expedition ? `${order.expedition.service} - ${order.expedition.trackingNumber}` : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'shipped' || ['delivered', 'accepted'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.status === 'shipped' || ['delivered', 'accepted'].includes(order.status) ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-gray-300"></div>}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">Shipped</div>
                    <div className="text-xs text-gray-500">
                      {order.status === 'shipped' || ['delivered', 'accepted'].includes(order.status) ? 'In Transit' : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'delivered' || order.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.status === 'delivered' || order.status === 'accepted' ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-gray-300"></div>}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">Delivered</div>
                    <div className="text-xs text-gray-500">
                      {order.status === 'delivered' || order.status === 'accepted' ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-6">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {order.status === 'accepted' ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-gray-300"></div>}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">Accepted</div>
                    <div className="text-xs text-gray-500">
                      {order.customerAcceptedAt ? new Date(order.customerAcceptedAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Info (if applicable) */}
            {(['return_requested', 'return_approved', 'return_shipped', 'return_received', 'returned'].includes(order.status)) && (
              <div className="border rounded-lg p-4 bg-purple-50">
                <h3 className="text-sm font-medium mb-3 text-purple-800">Return Information</h3>
                <div className="text-sm text-purple-700 space-y-2">
                  <p>
                    <span className="font-medium">Return Status:</span> {getStatusDisplayName(order.status)}
                  </p>
                  {order.return?.requestDate && (
                    <p>
                      <span className="font-medium">Requested:</span> {new Date(order.return.requestDate).toLocaleDateString()}
                    </p>
                  )}
                  {order.return?.reason && (
                    <p>
                      <span className="font-medium">Reason:</span> {order.return.reason}
                    </p>
                  )}
                  {order.return?.expedition && (
                    <>
                      <p>
                        <span className="font-medium">Return Shipment:</span> {order.return.expedition.service}
                      </p>
                      <p>
                        <span className="font-medium">Tracking Number:</span> {order.return.expedition.trackingNumber}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Notes Field - Always visible */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Admin Notes</h3>
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                  placeholder="Add any notes about this update..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            {/* Left side - Cancel Order button (only shown before order is with expedition) */}
            <div>
              {canBeCancelled && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={loading}
                  className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 flex items-center"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Cancel Order
                </button>
              )}
            </div>

            
            {/* Right side - Main action buttons */}
            {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            {/* Left side - Cancel Order button (only shown before order is with expedition) */}
            <div>
              {canBeCancelled && (
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={loading}
                  className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 flex items-center"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Cancel Order
                </button>
              )}
            </div>
            
            {/* Right side - Main action buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              
              {currentAction !== 'view-details' && (
                <button
                  type="submit"
                  disabled={loading || (currentAction === 'add-expedition' && (!selectedExpedition || !trackingNumber))}
                  className={`px-4 py-2 rounded-md text-white flex items-center
                    ${loading || (currentAction === 'add-expedition' && (!selectedExpedition || !trackingNumber)) 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : currentAction === 'confirm-payment'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {getNextStepIcon()}
                      <span className="ml-2">{getNextStepLabel()}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;