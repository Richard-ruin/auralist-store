import React, { useState, useEffect } from 'react';
import { X, Upload, Loader, Star } from 'lucide-react';
import StarRating from '../ui/StarRating';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingReview = null, 
  productName ,
  productId
}) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingReview) {
      setFormData({
        rating: editingReview.rating,
        title: editingReview.title,
        comment: editingReview.comment,
        images: []
      });
      // For editing, show existing images
      if (editingReview.images) {
        setPreviewImages(
          editingReview.images.map(img => ({
            url: `${process.env.REACT_APP_API_URL}/images/reviews/${img}`,
            isExisting: true,
            name: img
          }))
        );
      }
    }
  }, [editingReview]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    }
    if (formData.comment.length > 1000) {
      newErrors.comment = 'Comment must be less than 1000 characters';
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    const newPreviewImages = files.map(file => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('product', productId);
      submitData.append('rating', formData.rating.toString());
      submitData.append('title', formData.title);
      submitData.append('comment', formData.comment);
      
      // Handle images
      formData.images.forEach(image => {
        if (image instanceof File) {
          submitData.append('images', image);
        }
      });
  
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingReview ? 'Edit Review' : 'Write a Review'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Reviewing: {productName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
<div className="flex flex-col items-center mb-6">
  <label className="text-sm font-medium text-gray-700 mb-2">
    Your Rating (1-5 stars)
  </label>
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setFormData(prev => ({...prev, rating: star}))}
        className="focus:outline-none"
      >
        <Star
          className={`w-8 h-8 ${
            star <= formData.rating 
              ? 'fill-current text-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      </button>
    ))}
  </div>
  <span className="text-sm text-gray-500 mt-1">
    {formData.rating} out of 5 stars
  </span>
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Summarize your review"
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.comment ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Share your experience with this product"
                maxLength={1000}
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.comment.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Optional)
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {previewImages.length < 3 && (
                  <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      multiple
                    />
                    <Upload className="w-6 h-6 text-gray-400" />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Maximum 3 images (5MB each)
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;