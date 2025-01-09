const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const handleReviewUpload = require('../middleware/uploadReview');

// Public routes
router.get('/', reviewController.getAllReviews);

// Check review capability - pindahkan ke atas untuk prioritas
router.get('/can-review/:productId', 
  authMiddleware.protect,
  async (req, res, next) => {
    console.log('Review check requested for product:', req.params.productId);
    console.log('User:', req.user.id);
    next();
  },
  reviewController.checkCanReview
);

// Protected routes with file upload
router.post('/', 
  authMiddleware.protect,
  handleReviewUpload,
  reviewController.createReview
);

router.patch('/:id', 
  authMiddleware.protect,
  handleReviewUpload,
  reviewController.updateReview
);

// Protected routes without file upload
router.delete('/:id', 
  authMiddleware.protect,
  reviewController.deleteReview
);

router.post('/:id/like', 
  authMiddleware.protect,
  reviewController.toggleLike
);

router.post('/:id/dislike', 
  authMiddleware.protect,
  reviewController.toggleDislike
);

// Error handler khusus untuk route review
router.use((err, req, res, next) => {
  console.error('Review route error:', err);
  next(err);
});

module.exports = router;