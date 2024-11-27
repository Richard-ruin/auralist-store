// routes/brands.js
const express = require('express');
const router = express.Router();
const { 
  createBrand, 
  getAllBrands, 
  updateBrand, 
  deleteBrand 
} = require('../controllers/brandController');
const { protect, restrictTo } = require('../middleware/auth');
const uploadBrand = require('../middleware/uploadBrand');

router
  .route('/')
  .get(getAllBrands)
  .post(protect, restrictTo('admin'), uploadBrand.single('logo'), createBrand);

router
  .route('/:id')
  .patch(protect, restrictTo('admin'), uploadBrand.single('logo'), updateBrand)
  .delete(protect, restrictTo('admin'), deleteBrand);

module.exports = router;