const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/uploadProduct');
const { protect, restrictTo } = require('../middleware/auth');

// Add the stats route before other routes
router.get('/stats', protect, restrictTo('admin'), productController.getProductStats);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(protect, restrictTo('admin'), upload.array('images', 5), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(protect, restrictTo('admin'), upload.array('images', 5), productController.updateProduct)
  .delete(protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;