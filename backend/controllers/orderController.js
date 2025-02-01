// controllers/orderController.js
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Address = require('../models/Address'); // Make sure this is imported
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose'); // Add this import
const fs = require('fs');

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
// controllers/orderController.js
exports.checkCanReturn = catchAsync(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user.id;

  // Cek order yang eligible untuk return
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    status: 'delivered',
    'return': { $exists: false } // Pastikan belum pernah return
  });

  const canReturn = Boolean(order);

  res.status(200).json({
    status: 'success',
    canReturn,
    message: order 
      ? 'You can return this order'
      : 'This order is not eligible for return',
  });
});
exports.getReturnStats = catchAsync(async (req, res) => {
  const [
    totalReturns,
    returnRequested,
    returnApproved,
    returnRejected
  ] = await Promise.all([
    Order.countDocuments({ 'return': { $exists: true } }),
    Order.countDocuments({ status: 'return_requested' }),
    Order.countDocuments({ status: 'return_approved' }),
    Order.countDocuments({ status: 'return_rejected' })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalReturns,
      returnRequested,
      returnApproved,
      returnRejected
    }
  });
});

exports.getReturns = catchAsync(async (req, res) => {
  // Hanya ambil order yang memiliki return request
  const returns = await Order.find({
    status: { 
      $in: ['return_requested', 'return_approved', 'return_rejected'] 
    }
  })
  .populate('user', 'name email')
  .populate('items.product', 'name images')
  .sort('-return.requestDate');

  res.status(200).json({
    status: 'success',
    data: {
      orders: returns
    }
  });
});
exports.getReturnRequests = catchAsync(async (req, res) => {
  const returns = await Order.find({
    status: 'return_requested'
  })
  .populate('user', 'name email')
  .populate('items.product', 'name images')
  .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      orders: returns
    }
  });
});
exports.getUserOrders = catchAsync(async (req, res) => {
  const { status } = req.query;
  let query = { user: req.user._id };
  
  // Tambahkan filter status jika ada
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
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
exports.requestReturn = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  
  console.log('Return request received:', {
    orderId,
    reason,
    files: req.files,
    body: req.body
  });

  try {
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return next(new AppError('Order not found or not eligible for return', 404));
    }

    // Pastikan direktori upload ada
    const uploadDirs = [
      'public/uploads/returns',
      'public/uploads/returns/images',
      'public/uploads/returns/videos'
    ];

    uploadDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Get uploaded files dengan pengecekan yang lebih baik
    const images = req.files?.images ? 
      req.files.images.map(file => file.filename) : [];
      
    const unboxingVideo = req.files?.unboxingVideo?.[0]?.filename || null;

    console.log('Files to save:', { images, unboxingVideo }); // Debug

    // Update order with return request
    order.status = 'return_requested';
    order.return = {
      requestDate: Date.now(),
      status: 'pending',
      reason,
      images,
      unboxingVideo,
      processedAt: null,
      processedBy: null,
      adminNotes: null
    };

    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder); // Debug

    res.status(200).json({
      status: 'success',
      data: { order: savedOrder }
    });
  } catch (error) {
    console.error('Error processing return request:', error);
    // Hapus file yang telah diupload jika terjadi error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    return next(new AppError(`Failed to process return request: ${error.message}`, 500));
  }
});

// Process return (admin)
exports.processReturn = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, adminNotes } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    status: 'return_requested'
  });

  if (!order) {
    return next(new AppError('Return request not found', 404));
  }

  order.status = status === 'approved' ? 'return_approved' : 'return_rejected';
  order.return.status = status;
  order.return.adminNotes = adminNotes;
  order.return.processedBy = req.user._id;
  order.return.processedAt = Date.now();

  await order.save();

  res.status(200).json({
    status: 'success',
    data: { order }
  });
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