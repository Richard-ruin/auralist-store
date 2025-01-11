import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StarRating from '../ui/StarRating';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import ReviewModal from './ReviewModal'; // Tambahkan import ini

const ProductReviews = ({ 
  productId, 
  productName, 
  canReview, 
  showReviewModal, 
  setShowReviewModal,
  setEditingReview // Terima prop ini dari ProductDetail
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentEditingReview, setCurrentEditingReview] = useState(null);

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
    setCurrentEditingReview(review);
    setEditingReview(review); // Update parent state
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
  src={review.user.avatar?.startsWith('data:') 
    ? review.user.avatar 
    : `${process.env.REACT_APP_IMAGE_BASE_URL}/profiles/${review.user.avatar}`
  }
  alt={review.user.name}
  className="h-10 w-10 rounded-full object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    // You might want to add a fallback display here, like initials in a colored circle
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600';
    fallbackDiv.textContent = review.user.name.charAt(0).toUpperCase();
    e.target.parentNode.insertBefore(fallbackDiv, e.target.nextSibling);
  }}
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
  
        {review.images?.length > 0 && (
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
      
      {/* Review list */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewItem key={review._id} review={review} />
          ))
        ) : (
          <p className="text-gray-500 text-center">No reviews yet</p>
        )}
      </div>

      {/* Pagination */}
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