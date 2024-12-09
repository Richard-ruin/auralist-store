// routes/payment.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const uploadPayment = require('../middleware/uploadPayment');
const { protect, restrictTo } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validateOrder');

// Public routes
router.get('/bank-accounts', paymentController.getBankAccounts);

// Protected routes
router.use(protect);
router.get('/:id/status', paymentController.getPaymentStatus);
router.post(
  '/create',
  validatePayment,
  uploadPayment.single('proofImage'),
  paymentController.createPayment
);

// Admin routes
router.patch(
  '/confirm/:paymentId',
  protect,
  restrictTo('admin'),
  paymentController.confirmPayment
);

module.exports = router;