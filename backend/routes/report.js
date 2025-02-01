// backend/routes/report.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

// Tambahkan middleware protect dan restrictTo
router.get('/products', 
  protect, // Pastikan user terautentikasi
  restrictTo('admin'), // Pastikan user adalah admin
  reportController.getProductReport
);

module.exports = router;