import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ImageIcon } from 'lucide-react';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, order }) => {
  const [status, setStatus] = useState('confirmed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset states when modal opens with new order
  useEffect(() => {
    if (isOpen && order) {
      setStatus('confirmed');
      setNotes('');
      setImageError(false);
    }
  }, [isOpen, order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(status, notes);
      onClose();
    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  // Construct payment proof image URL with correct path
  const paymentProofUrl = order.paymentProof
    ? `${process.env.REACT_APP_API_URL}/images/payments/${order.paymentProof}`
    : null;

  console.log('Payment proof URL:', paymentProofUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Confirm Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid gap-3">
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
                <span className="capitalize">{order.status}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Customer:</span>{' '}
                {order.user?.name || 'Unknown'}
              </p>
            </div>

            {/* Payment Proof Image */}
            {paymentProofUrl ? (
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
            ) : (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Payment Proof</h3>
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No payment proof image available</p>
                </div>
              </div>
            )}

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="confirmed">Confirm Payment</option>
                <option value="rejected">Reject Payment</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
                placeholder="Add any notes about the payment confirmation..."
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white
                ${status === 'confirmed' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading 
                ? 'Processing...' 
                : status === 'confirmed' 
                  ? 'Confirm Payment' 
                  : 'Reject Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;