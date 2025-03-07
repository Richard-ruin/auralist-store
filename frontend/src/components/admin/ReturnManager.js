import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../ui/badge';

const ReturnManager = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState('return_requested');
  const [stats, setStats] = useState({
    totalReturns: 0,
    returnRequested: 0,
    returnApproved: 0,
    returnRejected: 0
  });
  const [processingOrders, setProcessingOrders] = useState(new Set());

  const fetchReturnStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/stats/returns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch return stats');
      
      const data = await response.json();
      // Provide default values if data is not as expected
      setStats({
        totalReturns: data.data?.totalReturns || 0,
        returnRequested: data.data?.returnRequested || 0,
        returnApproved: data.data?.returnApproved || 0,
        returnRejected: data.data?.returnRejected || 0
      });
    } catch (error) {
      console.error('Error fetching return stats:', error);
      // Set default values on error
      setStats({
        totalReturns: 0,
        returnRequested: 0,
        returnApproved: 0,
        returnRejected: 0
      });
    }
  };

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/returns?status=${filterStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login again');
          return;
        }
        throw new Error('Failed to fetch returns');
      }

      const data = await response.json();
      setReturns(data.data?.orders || []);
  } catch (error) {
    console.error('Error fetching returns:', error);
    toast.error('Failed to load return requests');
    setReturns([]); // Set to empty array on error
  } finally {
    setLoading(false);
  }
};

  const handleReturn = async (orderId, status, notes) => {
    if (processingOrders.has(orderId)) return;
    
    setProcessingOrders(prev => new Set([...prev, orderId]));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      if (!response.ok) throw new Error('Failed to process return');

      await response.json();
      toast.success(`Return ${status} successfully`);
      fetchReturns();
      fetchReturnStats();
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error('Failed to process return');
    } finally {
      setProcessingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  useEffect(() => {
    fetchReturnStats();
    fetchReturns();
  }, [filterStatus]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'return_requested':
        return 'warning';
      case 'return_approved':
        return 'success';
      case 'return_rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Return Management</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Returns</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReturns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.returnRequested}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Approved Returns</h3>
            <p className="text-2xl font-bold text-green-600">{stats.returnApproved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Rejected Returns</h3>
            <p className="text-2xl font-bold text-red-600">{stats.returnRejected}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Return Requests</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Returns</option>
          <option value="return_requested">Pending Review</option>
          <option value="return_approved">Approved</option>
          <option value="return_rejected">Rejected</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {returns.length === 0 ? (
          <p className="text-gray-500">No return requests found</p>
        ) : (
          returns.map((order) => (
            <div key={order._id} className="border p-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">Order #{order._id}</h3>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(order.return.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status.replace('return_', '').charAt(0).toUpperCase() + 
                     order.status.replace('return_', '').slice(1)}
                  </Badge>
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

              {expandedOrders[order._id] && (
                <>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Return Reason:</h4>
                    <p className="text-gray-600">{order.return.reason}</p>
                  </div>

                  {/* Images Section */}
                  {order.return.images && order.return.images.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Return Images:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {order.return.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={`${process.env.REACT_APP_API_URL}/uploads/returns/images/${img}`}
                            alt={`Return evidence ${idx + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Section */}
                  {order.return.unboxingVideo && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Unboxing Video:</h4>
                      <video
                        src={`${process.env.REACT_APP_API_URL}/uploads/returns/videos/${order.return.unboxingVideo}`}
                        controls
                        className="w-full max-h-48 object-contain"
                      />
                    </div>
                  )}

                  {/* Action Buttons - Only show for pending returns */}
                  {order.status === 'return_requested' && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                      <button
                        onClick={() => handleReturn(order._id, 'approved', 'Return approved')}
                        disabled={processingOrders.has(order._id)}
                        className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                          processingOrders.has(order._id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {processingOrders.has(order._id) ? 'Processing...' : 'Approve Return'}
                      </button>
                      <button
                        onClick={() => handleReturn(order._id, 'rejected', 'Return rejected')}
                        disabled={processingOrders.has(order._id)}
                        className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                          processingOrders.has(order._id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {processingOrders.has(order._id) ? 'Processing...' : 'Reject Return'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReturnManager;