const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validateOrder');

// Protect all routes
router.use(protect);

// Public routes (customer)
router.get('/my-orders', orderController.getUserOrders);
router.post('/', validateCreateOrder, orderController.createOrder);
router.patch('/:id', orderController.updateOrder);  // Tambahkan ini sebelum admin routes

// Admin routes
router.use(restrictTo('admin'));

// Stats route harus di atas route dengan parameter
router.get('/stats', orderController.getOrderStats);
router.get('/all', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderDetails);
router.patch('/:orderId/confirm-payment', orderController.confirmPayment);

module.exports = router;