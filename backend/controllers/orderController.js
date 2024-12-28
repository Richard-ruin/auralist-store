// controllers/orderController.js
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Address = require('../models/Address'); // Make sure this is imported
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose'); // Add this import

exports.createOrder = catchAsync(async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      totalAmount,
      currency = 'USD'
    } = req.body;

    // Create order tanpa payment method
    const orderData = {
      user: req.user._id,
      items: items.map(item => ({
        product: item.product,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      shippingAddress,
      totalAmount: Number(totalAmount),
      currency,
      status: 'processing' // default status
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
});
exports.getOrderStats = catchAsync(async (req, res) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, monthlyOrders, stats] = await Promise.all([
    // Get all orders for basic stats
    Order.find().select('status totalAmount createdAt'),
    
    // Get this month's orders
    Order.find({
      createdAt: { $gte: firstDayOfMonth }
    }).select('totalAmount'),

    // Get aggregated stats
    Order.aggregate([
      {
        $facet: {
          pending: [
            { $match: { status: 'pending' } },
            { $count: 'count' }
          ],
          processing: [
            { $match: { status: 'processing' } },
            { $count: 'count' }
          ],
          monthly: [
            {
              $group: {
                _id: { 
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ]
        }
      }
    ])
  ]);

  const total = orders.length;
  const thisMonth = monthlyOrders.length;
  const pending = stats[0].pending[0]?.count || 0;
  const processing = stats[0].processing[0]?.count || 0;

  res.status(200).json({
    status: 'success',
    data: {
      total,
      thisMonth,
      pending,
      processing,
      monthly: stats[0].monthly
    }
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  // Verify user owns the order
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!order) {
    return next(new AppError('Order not found or unauthorized', 403));
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentMethod: req.body.paymentMethod },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

exports.getOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  if (!order) {
    throw new AppError('No order found with that ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Add this to controllers/orderController.js
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  // Validate status
  const validStatuses = ['confirmed', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  // Find and update the order
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Validate status transition
  const validTransitions = {
    'confirmed': ['shipped'],
    'shipped': ['delivered'],
    'delivered': []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new AppError(`Invalid status transition from ${order.status} to ${status}`, 400);
  }

  // Update order
  order.status = status;
  order.notes = notes;
  order.updatedAt = Date.now();
  order.updatedBy = req.user._id;

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});
exports.confirmPayment = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  // Validasi status
  if (!['confirmed', 'rejected'].includes(status)) {
    throw new AppError('Invalid payment status', 400);
  }

  // Cari order dan payment
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Cari payment terkait
  const payment = await Payment.findOne({ order: orderId });
  
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Update payment status
  payment.status = status;
  payment.notes = notes;
  payment.confirmedAt = Date.now();
  payment.confirmedBy = req.user._id;
  await payment.save();

  // Update order status
  order.paymentStatus = status === 'confirmed' ? 'completed' : 'failed';
  order.status = status === 'confirmed' ? 'confirmed' : 'cancelled';
  order.paymentConfirmedAt = payment.confirmedAt;
  order.paymentConfirmedBy = payment.confirmedBy;
  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order,
      payment
    }
  });
});

// Get all orders with detailed info for admin
exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name price')
    .populate('shippingAddress')
    .populate('paymentConfirmedBy', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});
// Add this to orderController.js
exports.getUserOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product')
    .populate('shippingAddress')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});
// Get order details
exports.getOrderDetails = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name price')
    .populate('shippingAddress')
    .populate('paymentConfirmedBy', 'name');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Get payment info
  const payment = await Payment.findOne({ order: order._id });

  res.status(200).json({
    status: 'success',
    data: {
      order,
      payment
    }
  });
});

exports.getOrderStats = catchAsync(async (req, res) => {
  try {
    // Get current date for this month calculation
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel for better performance
    const [
      totalOrders,
      thisMonthOrders,
      pendingOrders,
      processingOrders
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),
      
      // Orders this month
      Order.countDocuments({
        createdAt: { $gte: firstDayOfMonth }
      }),
      
      // Pending orders (with pending payment)
      Order.countDocuments({
        paymentStatus: 'pending'
      }),
      
      // Processing orders
      Order.countDocuments({
        status: 'processing'
      })
    ]);

    // Send response
    res.status(200).json({
      status: 'success',
      data: {
        total: totalOrders,
        thisMonth: thisMonthOrders,
        pending: pendingOrders,
        processing: processingOrders
      }
    });
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw new AppError('Error fetching order statistics', 500);
  }
});