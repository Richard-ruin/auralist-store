import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ReturnManager = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReturns: 0,
    returnRequested: 0,
    returnApproved: 0,
    returnRejected: 0
  });

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
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching return stats:', error);
    }
  };

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders?status=return_requested`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login again');
          // Redirect to login if needed
          return;
        }
        throw new Error('Failed to fetch returns');
      }

      const data = await response.json();
      setReturns(data.data.orders);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (orderId, status, notes) => {
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

      const data = await response.json();
      toast.success(`Return ${status} successfully`);
      fetchReturns(); // Refresh list
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error('Failed to process return');
    }
  };

  useEffect(() => {
    fetchReturnStats();
    fetchReturns();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Return Management</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
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

      <h2 className="text-2xl font-bold mb-4">Return Requests</h2>
      
      <div className="space-y-4">
        {returns.length === 0 ? (
          <p className="text-gray-500">No return requests found</p>
        ) : (
          returns.map((order) => (
            <div key={order._id} className="border p-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-medium">Order #{order._id}</h3>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(order.return.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Return Reason:</h4>
                <p className="text-gray-600">{order.return.reason}</p>
              </div>

              {/* Evidence Section */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Evidence:</h4>
                {order.return.images && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {order.return.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`${process.env.REACT_APP_API_URL}/uploads/returns/images/${img}`}
                        alt={`Return evidence ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                {order.return.unboxingVideo && (
                  <div className="mt-2">
                    <video
                      src={`${process.env.REACT_APP_API_URL}/uploads/returns/videos/${order.return.unboxingVideo}`}
                      controls
                      className="w-full max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleReturn(order._id, 'approved', 'Return approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve Return
                </button>
                <button
                  onClick={() => handleReturn(order._id, 'rejected', 'Return rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject Return
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReturnManager;
