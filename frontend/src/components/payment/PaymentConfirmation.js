import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';

const PaymentConfirmation = ({ orderId, paymentMethod, onBack, onSuccess }) => {
  const { createPayment, loading } = usePayment();
  const [proofImage, setProofImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setError('');
      setProofImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirm = async () => {
    if (!proofImage) {
      setError('Please upload your payment proof');
      return;
    }

    try {
      await createPayment(orderId, paymentMethod, proofImage);
      onSuccess();
    } catch (error) {
      setError(error.message || 'Failed to submit payment proof');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to payment details
      </button>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Upload Payment Proof
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please upload a clear image of your payment receipt
          </p>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Receipt
            </label>
            
            {!preview ? (
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
                    <p className="font-medium text-indigo-600">Click to upload</p>
                    <p className="mt-1">or drag and drop</p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Payment proof"
                  className="w-full h-auto"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setProofImage(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Guidelines for Payment Proof:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Make sure the transfer amount is clearly visible</li>
              <li>• Include the transaction date and time</li>
              <li>• Ensure the receipt shows the recipient's account details</li>
              <li>• Image should be clear and readable</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleConfirm}
              disabled={!proofImage || loading}
              className={`flex items-center px-6 py-2 rounded-lg text-white 
                ${proofImage && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Processing...' : 'Submit Payment Proof'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;