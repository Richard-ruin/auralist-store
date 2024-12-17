// controllers/paymentController.js
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createPayment = catchAsync(async (req, res) => {
  console.log('Payment creation request:', {
    body: req.body,
    file: req.file
  });

  const { orderId, paymentMethod } = req.body;

  // Validasi input dasar
  if (!orderId || !paymentMethod) {
    throw new AppError('Order ID and payment method are required', 400);
  }

  if (!req.file) {
    throw new AppError('Payment proof image is required', 400);
  }

  // Cari order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verifikasi order milik user yang sedang login
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to submit payment for this order', 403);
  }

  // Create payment record
  const payment = await Payment.create({
    order: orderId,
    paymentMethod,
    amount: order.totalAmount,
    currency: order.currency,
    proofImage: req.file.filename,
    expiredAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  // Update order
  order.paymentStatus = 'pending';
  order.paymentProof = req.file.filename;
  order.paymentExpiredAt = payment.expiredAt;
  await order.save();

  res.status(201).json({
    status: 'success',
    data: {
      payment,
      order
    }
  });
});
exports.getBankAccounts = (req, res) => {
  const accounts = {
    visa: {
      name: "Auralist Store",
      number: "4532 0159 8744 6321"
    },
    mastercard: {
      name: "Auralist Store",
      number: "5412 7534 9821 0063"
    },
    bri: {
      name: "Auralist Store",
      number: "0123 0124 5678 901"
    },
    bca: {
      name: "Auralist Store",
      number: "8736 4521 9087"
    },
    mandiri: {
      name: "Auralist Store",
      number: "1270 0012 3456 789"
    }
  };
  
  res.status(200).json({
    status: 'success',
    data: accounts
  });
};



exports.confirmPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { status, notes } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check if payment is expired
  if (new Date() > payment.expiredAt) {
    payment.status = 'expired';
    await payment.save();
    throw new AppError('Payment has expired', 400);
  }

  payment.status = status;
  payment.notes = notes;
  payment.confirmedAt = Date.now();
  payment.confirmedBy = req.user._id;
  await payment.save();

  // Update order status
  const order = await Order.findById(payment.order);
  order.paymentStatus = status === 'confirmed' ? 'completed' : 'failed';
  order.paymentConfirmedAt = payment.confirmedAt;
  order.paymentConfirmedBy = payment.confirmedBy;
  order.status = status === 'confirmed' ? 'confirmed' : 'cancelled';
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      order
    }
  });
});

exports.getPaymentStatus = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('order', 'totalAmount status');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});