import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StarRating from '../ui/StarRating';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
const ProductReviews = ({ productId, productName, canReview, showReviewModal, setShowReviewModal }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editingReview, setEditingReview] = useState(null); // Add this line
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });

  // Reset reviewData when modal is opened for a new review
  useEffect(() => {
    if (showReviewModal && !editingReview) {
      setReviewData({
        rating: 5,
        title: '',
        comment: '',
        images: []
      });
    }
  }, [showReviewModal, editingReview]);

  // Set review data when editing
  useEffect(() => {
    if (editingReview) {
      setReviewData({
        rating: editingReview.rating,
        title: editingReview.title,
        comment: editingReview.comment,
        images: []
      });
    }
  }, [editingReview]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', reviewData.rating);
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);
      
      reviewData.images.forEach(image => {
        formData.append('images', image);
      });

      if (editingReview) {
        await reviewService.updateReview(editingReview._id, formData);
        toast.success('Review updated successfully');
      } else {
        await reviewService.createReview(formData);
        toast.success('Review submitted successfully');
      }

      setShowReviewModal(false);
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };




const ReviewModal = () => (
  <dialog
    open={showReviewModal}
    className="fixed inset-0 z-50 overflow-y-auto"
  >
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rating</label>
            <StarRating
              rating={reviewData.rating}
              onChange={(rating) => setReviewData(prev => ({...prev, rating}))}
              interactive
              size="lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={reviewData.title}
              onChange={(e) => setReviewData(prev => ({...prev, title: e.target.value}))}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData(prev => ({...prev, comment: e.target.value}))}
              className="w-full border rounded-md p-2 h-32"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Images (max 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 3);
                setReviewData(prev => ({...prev, images: files}));
              }}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>
);  
  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getProductReviews(productId, page);
      setReviews(response.data.reviews);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  const handleLikeToggle = async (reviewId) => {
    if (!user) {
      navigate('/login', { 
        state: { returnUrl: window.location.pathname }
      });
      return;
    }
    
    try {
      await reviewService.toggleLike(reviewId);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleDislikeToggle = async (reviewId) => {
    if (!user) {
      navigate('/login', { 
        state: { returnUrl: window.location.pathname }
      });
      return;
    }

    try {
      await reviewService.toggleDislike(reviewId);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update dislike');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewService.deleteReview(reviewId);
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const ReviewItem = ({ review }) => {
    const isOwner = user && user.id === review.user._id;
    
    return (
      <div className="border-b border-gray-200 py-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <img
              src={review.user.avatar || '/api/placeholder/40/40'}
              alt={review.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">
                  {review.user.name}
                  {review.edited && (
                    <span className="text-sm text-gray-500 ml-2">(edited)</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="mt-1">
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(review)}
                className="text-gray-400 hover:text-gray-500"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(review._id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <h5 className="mt-2 font-medium">{review.title}</h5>
        <p className="mt-2 text-gray-600">{review.comment}</p>

        {review.images && review.images.length > 0 && (
          <div className="mt-3 flex space-x-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={`${process.env.REACT_APP_API_URL}/images/reviews/${image}`}
                alt={`Review ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => handleLikeToggle(review._id)}
            className={`flex items-center space-x-1 ${
              review.likes.includes(user?.id) ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.likes.length}</span>
          </button>
          <button
            onClick={() => handleDislikeToggle(review._id)}
            className={`flex items-center space-x-1 ${
              review.dislikes.includes(user?.id) ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{review.dislikes.length}</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
      
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-l-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-r-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;