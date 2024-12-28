const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validateOrder');

// Protect all routes
router.use(protect);

// Base route for getting orders with pagination
router.get('/', orderController.getOrders);  // Add this line

// Public routes (customer)
router.get('/my-orders', orderController.getUserOrders);
router.post('/', validateCreateOrder, orderController.createOrder);
router.patch('/:id', orderController.updateOrder);

// Admin routes
router.use(restrictTo('admin'));

// Stats route must be before parameterized routes
router.get('/stats', orderController.getOrderStats);
router.get('/all', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.patch('/:orderId/status', orderController.updateOrderStatus);
router.patch('/:orderId/confirm-payment', orderController.confirmPayment);

module.exports = router;