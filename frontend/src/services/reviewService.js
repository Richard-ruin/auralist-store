import api from './api';

const reviewService = {
  canReview: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { canReview: false, message: 'Authentication required' };
      }

      const response = await api.get(`/reviews/can-review/${productId}`);
      console.log('Can review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in canReview service:', error.response?.data || error);
      if (error.response?.status === 401) {
        return { canReview: false, message: 'Authentication required' };
      }
      throw error;
    }
  },

  getProductReviews: async (productId, page = 1) => {
    try {
      const response = await api.get(`/reviews?productId=${productId}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw error;
    }
  },

  createReview: async (reviewData) => {
    try {
      const formData = new FormData();
      Object.keys(reviewData).forEach(key => {
        if (key === 'images') {
          reviewData[key].forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, reviewData[key]);
        }
      });

      const response = await api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
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