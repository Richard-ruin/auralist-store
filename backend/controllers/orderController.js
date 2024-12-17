// controllers/orderController.js
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Address = require('../models/Address'); // Make sure this is imported
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose'); // Add this import

exports.createOrder = catchAsync(async (req, res, next) => {
  try {
    console.log('Received order data:', req.body);
    
    const {
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      currency = 'USD'
    } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(shippingAddress)) {
      return next(new AppError('Invalid shipping address ID', 400));
    }

    // Check if address exists and belongs to user
    const address = await Address.findOne({
      _id: shippingAddress,
      user: req.user._id
    });

    if (!address) {
      return next(new AppError('Shipping address not found or does not belong to user', 400));
    }

    // Create order object
    const orderData = {
      user: req.user._id,
      items: items.map(item => ({
        product: item.product,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'pending',
      totalAmount: Number(totalAmount),
      currency,
      paymentExpiredAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };

    console.log('Creating order with data:', orderData);

    const order = await Order.create(orderData);
    
    console.log('Order created successfully:', order);

    res.status(201).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error creating order:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      return next(new AppError(error.message, 400));
    }
    
    next(error);
  }
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

exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

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