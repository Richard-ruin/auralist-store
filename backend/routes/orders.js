// routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validateOrder');

// Protect all routes after this middleware
router.use(protect);

// Customer routes
router.post('/', validateCreateOrder, orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/my-orders/:id', orderController.getOrder);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;