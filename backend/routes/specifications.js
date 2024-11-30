// routes/specifications.js
const express = require('express');
const router = express.Router();
const { 
  getAllSpecifications,
  getSpecificationsByCategory,
  createSpecification,
  updateSpecification,
  deleteSpecification,
  bulkCreateSpecifications,
  reorderSpecifications
} = require('../controllers/specificationController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', getAllSpecifications);
router.get('/category/:categoryId', getSpecificationsByCategory);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createSpecification);
router.post('/bulk', bulkCreateSpecifications);
router.post('/reorder', reorderSpecifications);
router.patch('/:id', updateSpecification);
router.delete('/:id', deleteSpecification);

module.exports = router;