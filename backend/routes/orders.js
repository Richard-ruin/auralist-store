// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validateOrder');
const uploadReturnFiles = require('../middleware/uploadReturn'); // Add this import

// Protect all routes
router.use(protect);

// Base route for getting orders with pagination
router.get('/', orderController.getOrders);

// Public routes (customer)
router.get('/my-orders', orderController.getUserOrders);
router.post('/', validateCreateOrder, orderController.createOrder);
router.patch('/:id', orderController.updateOrder);

// Return routes
router.post(
  '/:orderId/return',
  uploadReturnFiles,
  orderController.requestReturn
);
router.get(
    '/:orderId/can-return',
    protect, // Pastikan user terautentikasi
    orderController.checkCanReturn
  );

// Admin routes
router.use(restrictTo('admin'));

router.patch(
  '/:orderId/return',
  orderController.processReturn
);

// Stats route must be before parameterized routes
router.get('/stats', orderController.getOrderStats);
router.get('/all', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.patch('/:orderId/status', orderController.updateOrderStatus);
router.patch('/:orderId/confirm-payment', orderController.confirmPayment);
router.get('/returns', orderController.getReturnRequests); 
router.get('/stats/returns', orderController.getReturnStats);
router.get('/returns', orderController.getReturns);
router.patch('/:orderId/return', orderController.processReturn);


module.exports = router;