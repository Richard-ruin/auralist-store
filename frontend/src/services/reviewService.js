import api from './api';

const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((totalRating / reviews.length).toFixed(1));
};


const reviewService = {
  createReview: async (formData) => {
    try {
      // Log the formData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Review creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error.response?.data || error);
      throw error;
    }
  },

  canReview: async (productId) => {
    try {
      const response = await api.get(`/reviews/can-review/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Can review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking review capability:', error.response?.data || error);
      return { canReview: false };
    }
  },
  getProductRating: async (productId) => {
    try {
      const response = await api.get(`/reviews?productId=${productId}`);
      const reviews = response.data.data.reviews;
      
      return {
        averageRating: calculateAverageRating(reviews),
        totalReviews: reviews.length
      };
    } catch (error) {
      console.error('Error getting product rating:', error);
      return {
        averageRating: 0,
        totalReviews: 0
      };
    }
  },

  getProductReviews: async (productId, page = 1) => {
    try {
      const response = await api.get(`/reviews?productId=${productId}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  createReview: async (formData) => {
  try {
    // Add logging
    console.log('Sending review data:', Object.fromEntries(formData));
    
    const response = await api.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error.response?.data || error);
    throw error;
  }
},

  updateReview: async (reviewId, reviewData) => {
    try {
      const formData = new FormData();
      Object.keys(reviewData).forEach(key => {
        if (key === 'images' && reviewData[key]) {
          reviewData[key].forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, reviewData[key]);
        }
      });

      const response = await api.patch(`/reviews/${reviewId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  toggleLike: async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  toggleDislike: async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/dislike`);
      return response.data;
    } catch (error) {
      console.error('Error toggling dislike:', error);
      throw error;
    }
  }
};

export default reviewService;