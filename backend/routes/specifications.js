// routes/specifications.js
const express = require('express');
const router = express.Router();
const { 
  createSpecification,
  getAllSpecifications,
  getSpecificationsByCategory,
  updateSpecification,
  deleteSpecification,
  reorderSpecifications
} = require('../controllers/specificationController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', getAllSpecifications);
router.get('/category/:categoryId', getSpecificationsByCategory);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router
  .route('/')
  .post(createSpecification);

router
  .route('/:id')
  .patch(updateSpecification)
  .delete(deleteSpecification);

router.post('/reorder', reorderSpecifications);

module.exports = router;