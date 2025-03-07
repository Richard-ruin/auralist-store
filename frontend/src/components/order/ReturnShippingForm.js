import React, { useState } from 'react';
import { X, Package, ChevronRight, UploadCloud } from 'lucide-react';
import returnService from '../../services/returnService';
import { toast } from 'react-hot-toast';

const ReturnRequestForm = ({ orderId, onSuccess, onCancel }) => {
  const [reason, setReason] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (errors.reason) {
      setErrors({ ...errors, reason: '' });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate max file size (2MB) and type
    const validFiles = files.filter(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 2MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });
    
    // Generate previews for valid files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    
    setImages(images.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for your return request';
    }
    
    if (images.length === 0) {
      newErrors.images = 'Please upload at least one image of the product';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Format data for API
      const formData = new FormData();
      formData.append('reason', reason);
      
      // Append each image with a unique field name to ensure the server processes them correctly
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });
      
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Return Request</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <p className="text-sm text-blue-800 font-medium mb-2">Return Policy</p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
          <li>Returns must be requested within 14 days of delivery</li>
          <li>Product must be in original condition with packaging</li>
          <li>Please provide clear photos of the product</li>
          <li>Return shipping costs are the responsibility of the customer</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Return*
            </label>
            <textarea
              value={reason}
              onChange={handleReasonChange}
              className={`w-full border ${errors.reason ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 h-24`}
              placeholder="Please explain why you want to return this product..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images*
            </label>
            <div className={`border-2 border-dashed ${errors.images ? 'border-red-300' : 'border-gray-300'} rounded-md p-4`}>
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Upload photos
                    </span>
                    <input
                      id="image-upload"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            </div>
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images}</p>
            )}

            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p>* Required fields</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                Submit Request <ChevronRight className="ml-2 w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnRequestForm;