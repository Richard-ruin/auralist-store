const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { uploadPayment } = require('../middleware/uploadPayment');

router.use(protect);

// Get bank account info
router.get('/bank-accounts', paymentController.getBankAccounts);

// Handle payment creation with file upload
router.post('/create', 
  uploadPayment.single('proofImage'),
  (req, res, next) => {
    console.log('Upload middleware processed:', req.file);
    next();
  },
  paymentController.createPayment
);

// Get payment status
router.get('/:paymentId/status', paymentController.getPaymentStatus);

module.exports = router;