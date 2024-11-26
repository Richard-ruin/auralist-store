const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getAllCategories, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(getAllCategories)
  .post(protect, restrictTo('admin'), upload.single('image'), createCategory);

router
  .route('/:id')
  .patch(protect, restrictTo('admin'), upload.single('image'), updateCategory)
  .delete(protect, restrictTo('admin'), deleteCategory);

module.exports = router;