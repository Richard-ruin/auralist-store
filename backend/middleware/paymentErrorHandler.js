// middleware/paymentErrorHandler.js
const AppError = require('../utils/appError');

exports.handlePaymentError = (err, req, res, next) => {
  console.error('Payment Error:', err);

  // Handle specific payment errors
  if (err.code === 'INSUFFICIENT_FUNDS') {
    return next(new AppError('Insufficient funds for this transaction', 400));
  }

  if (err.code === 'CARD_DECLINED') {
    return next(new AppError('Card was declined. Please try another card', 400));
  }

  if (err.code === 'INVALID_CARD') {
    return next(new AppError('Invalid card information provided', 400));
  }

  if (err.code === 'EXPIRED_CARD') {
    return next(new AppError('Card has expired', 400));
  }

  if (err.code === 'PROCESSING_ERROR') {
    return next(new AppError('Error processing payment. Please try again', 500));
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return next(new AppError(errors.join('. '), 400));
  }

  // Handle file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Payment proof file is too large. Maximum size is 5MB', 400));
    }
    return next(new AppError(err.message, 400));
  }

  // Handle duplicate transaction error
  if (err.code === 11000) {
    return next(new AppError('Duplicate transaction detected', 400));
  }

  // If error hasn't been handled above, pass it to the global error handler
  next(err);
};

// Middleware to validate payment method
exports.validatePaymentMethod = (req, res, next) => {
  const { method } = req.body;
  const validMethods = ['credit_card', 'bank_transfer'];

  if (!method || !validMethods.includes(method)) {
    return next(new AppError('Invalid payment method', 400));
  }

  next();
};

// Middleware to check if payment is allowed
exports.checkPaymentAllowed = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.paymentStatus === 'completed') {
      return next(new AppError('Order has already been paid', 400));
    }

    if (order.status === 'cancelled') {
      return next(new AppError('Cannot pay for cancelled order', 400));
    }

    // Add order to request for use in next middleware
    req.order = order;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check payment amount
exports.validatePaymentAmount = (req, res, next) => {
  const { amount } = req.body;
  const orderAmount = req.order.totalAmount;

  if (!amount || amount !== orderAmount) {
    return next(new AppError('Payment amount does not match order total', 400));
  }

  next();
};