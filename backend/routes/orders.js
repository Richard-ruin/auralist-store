// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const uploadReturnFiles = require('../middleware/uploadReturn');
const Order = require('../models/Order');

// Protect all routes
router.use(protect);

// PENTING: Letakkan routes tanpa parameter ID di awal
// Stats & General Queries (Akses Admin)
router.get('/stats', restrictTo('admin'), orderController.getOrderStats);
router.get('/stats/returns', restrictTo('admin'), orderController.getReturnStats);
router.get('/returns', restrictTo('admin'), orderController.getReturns);
router.get('/all', restrictTo('admin'), orderController.getAllOrders);

// Routes dengan query parameters
router.get('/', restrictTo('admin'), async (req, res) => {
  const { limit, sort, status } = req.query;
  try {
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .limit(parseInt(limit) || 50)
      .sort(sort || '-createdAt')
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Customer Routes
router.get('/my-orders', orderController.getUserOrders);
router.post('/', orderController.createOrder);
router.patch('/:id', orderController.updateOrder);

// Customer Actions Routes
router.post('/:orderId/accept-delivery', orderController.acceptDelivery);
router.post('/:orderId/return-shipping', orderController.submitReturnShipping);

// Return Routes
router.post(
  '/:orderId/return',
  uploadReturnFiles,
  orderController.requestReturn
);

router.get(
  '/:orderId/can-return',
  orderController.checkCanReturn
);

// Admin Routes dengan ID parameter
router.patch(
  '/:orderId/return-process',
  restrictTo('admin'),
  orderController.processReturn
);

router.patch(
  '/:orderId/status',
  restrictTo('admin'),
  orderController.updateOrderStatus
);

router.patch(
  '/:orderId/confirm-payment',
  restrictTo('admin'),
  orderController.confirmPayment
);

router.get(
  '/:orderId/details',
  restrictTo('admin'),
  orderController.getOrderDetails
);

// Route ini harus berada di paling akhir karena menggunakan parameter dinamis
router.get('/:orderId', orderController.getOrder);

module.exports = router;