// middleware/validateOrder.js
const { check, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.validateCreateOrder = [
  // Validate items array
  check('items')
    .isArray()
    .notEmpty()
    .withMessage('Items are required'),
  
  check('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  
  check('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  check('items.*.price')
    .isNumeric()
    .withMessage('Valid price is required'),

  // Shipping address should be MongoDB ObjectId, not object
  check('shippingAddress')
    .isMongoId()
    .withMessage('Valid shipping address ID is required'),

  check('paymentMethod')
    .isIn(['visa', 'mastercard', 'bri', 'bca', 'mandiri', 'pending'])
    .withMessage('Invalid payment method'),
  
  check('totalAmount')
    .isNumeric()
    .withMessage('Total amount must be a number'),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

exports.validatePayment = [
  check('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  check('paymentMethod')
    .isIn(['visa', 'mastercard', 'bri', 'bca', 'mandiri'])
    .withMessage('Invalid payment method'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];