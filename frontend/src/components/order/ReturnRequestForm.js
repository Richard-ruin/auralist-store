// components/order/ReturnRequestForm.js
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import returnService from '../../services/returnService';

const ReturnRequestForm = ({ orderId, onSuccess, onCancel }) => {
  const [reason, setReason] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    
    setImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('Video must be less than 100MB');
        return;
      }
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('reason', reason);
      images.forEach(img => formData.append('images', img));
      if (video) formData.append('unboxingVideo', video);

      await returnService.submitReturn(orderId, formData);
      toast.success('Return request submitted successfully');
      onSuccess();
    } catch (error) {
      console.error('Return submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Return Request</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Return *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows="4"
            placeholder="Please explain why you want to return this item..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Max 4)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span>Upload product images</span>
                  <input
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    max="4"
                  />
                </label>
              </div>
            </div>
          </div>
          {imagePreview.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(prev => prev.filter((_, i) => i !== index));
                      setImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Unboxing Video
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span>Upload video</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">Max size 100MB</p>
            </div>
          </div>
          {videoPreview && (
            <div className="mt-4">
              <video
                src={videoPreview}
                controls
                className="w-full max-h-48 object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoPreview('');
                  setVideo(null);
                }}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Remove video
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md 
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
          >
            {loading ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnRequestForm;