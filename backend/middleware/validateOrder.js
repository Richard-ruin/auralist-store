// middleware/validateOrder.js
const { check, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.validateCreateOrder = [
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
  check('shippingAddress')
    .isObject()
    .notEmpty()
    .withMessage('Shipping address is required'),
  check('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  check('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  check('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  check('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required'),
  check('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required'),
  check('paymentMethod')
    .isIn(['visa', 'mastercard', 'bri', 'bca', 'mandiri'])
    .withMessage('Invalid payment method'),
  check('totalAmount')
    .isNumeric()
    .withMessage('Total amount must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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