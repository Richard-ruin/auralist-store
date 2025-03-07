// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');
const { ExpeditionService } = require('../models/ExpeditionService');

// Get all orders (admin only)
exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name price images')
    .populate('shippingAddress')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Get user's orders
exports.getUserOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name price images stock')
    .populate('shippingAddress')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Get a specific order
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name price images stock')
    .populate('shippingAddress');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if the order belongs to the current user or if the user is an admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to access this order', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Create a new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod = 'pending', totalAmount } = req.body;

  // Validate input
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Please provide at least one item', 400));
  }

  if (!shippingAddress) {
    return next(new AppError('Please provide a shipping address', 400));
  }

  // Check if products exist and are in stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Product with ID ${item.product} not found`, 404));
    }
    
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }
  }

  // Create new order
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
    status: 'processing'
  });

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }
    );
  }

  // Populate product details for the response
  const populatedOrder = await Order.findById(order._id)
    .populate('items.product', 'name price images')
    .populate('shippingAddress');

  // Send order confirmation email
  try {
    await sendEmail({
      email: req.user.email,
      subject: 'Your Order Confirmation',
      message: `Thank you for your order! Your order ID is ${order._id}.`
    });
  } catch (error) {
    console.error('Email error:', error);
  }

  res.status(201).json({
    status: 'success',
    data: {
      order: populatedOrder
    }
  });
});

// Update order status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, notes, expedition } = req.body;
  
  console.log('Received update data:', { status, notes, expedition });
  
  if (!status) {
    return next(new AppError('Please provide a status', 400));
  }

  const validStatuses = [
    'processing', 'confirmed', 'being_packed', 'managed_by_expedition',
    'shipped', 'delivered', 'accepted', 'cancelled',
    'return_requested', 'return_approved', 'return_shipped', 'return_received',
    'return_rejected', 'returned'
  ];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Update the order status
  order.status = status;
  
  if (notes) {
    order.notes = notes;
  }

  // If expedition details are provided, update them
  if (expedition && status === 'managed_by_expedition') {
    console.log('Setting expedition data:', expedition);
    order.expedition = expedition;
  }

  // Set timestamp for customer acceptance
  if (status === 'accepted') {
    order.customerAcceptedAt = new Date();
  }

  try {
    await order.save();
    console.log('Order saved successfully with status:', status);
    if (expedition) {
      console.log('Expedition data saved:', order.expedition);
    }
  } catch (err) {
    console.error('Error saving order:', err);
    return next(new AppError('Error saving order: ' + err.message, 500));
  }

  // If the status is being updated to 'confirmed', update the payment info
  if (status === 'confirmed' && req.user.role === 'admin') {
    order.paymentConfirmedAt = new Date();
    order.paymentConfirmedBy = req.user._id;
    await order.save();
  }

  // Email functionality removed as requested

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Update order
exports.updateOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;
  
  // Only allow updating certain fields
  const updateData = {};
  
  if (shippingAddress) updateData.shippingAddress = shippingAddress;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Only allow the user who created the order or an admin to update it
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this order', 403));
  }
  
  // Only allow updating orders in certain statuses
  if (!['processing', 'confirmed'].includes(order.status)) {
    return next(new AppError('This order cannot be updated anymore', 400));
  }
  
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('items.product', 'name price images');
  
  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});

// Confirm payment
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  
  if (!['confirmed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }
  
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  order.status = status;
  order.notes = notes || order.notes;
  
  if (status === 'confirmed') {
    order.paymentConfirmedAt = new Date();
    order.paymentConfirmedBy = req.user._id;
  }
  
  await order.save();
  
  // Send email notification
  try {
    const user = await User.findById(order.user);
    
    if (user) {
      const subject = status === 'confirmed' 
        ? 'Your Payment Has Been Confirmed' 
        : 'Your Order Has Been Cancelled';
      
      const message = status === 'confirmed'
        ? `Your payment for order ${order._id} has been confirmed. We will start processing your order soon.`
        : `Your order ${order._id} has been cancelled. Please contact customer support if you have any questions.`;
      
      await sendEmail({
        email: user.email,
        subject,
        message
      });
    }
  } catch (error) {
    console.error('Email error:', error);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Customer accepts order delivery
exports.acceptDelivery = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the order belongs to the current user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to accept this order', 403));
  }
  
  // Only delivered orders can be accepted
  if (order.status !== 'delivered') {
    return next(new AppError('This order is not in delivered status', 400));
  }
  
  // Update the order status
  order.status = 'accepted';
  order.customerAcceptedAt = new Date();
  
  await order.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Request return
exports.requestReturn = catchAsync(async (req, res, next) => {
  const { reason, images } = req.body;
  
  if (!reason) {
    return next(new AppError('Please provide a reason for your return', 400));
  }
  
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the order belongs to the current user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to return this order', 403));
  }
  
  // Only accepted orders can be returned
  if (order.status !== 'accepted') {
    return next(new AppError('This order cannot be returned at this time', 400));
  }
  
  // Check if there's already a return request
  if (order.status === 'return_requested' || order.status === 'return_approved') {
    return next(new AppError('A return request already exists for this order', 400));
  }
  
  // Process uploaded images if any
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(file => file.filename);
  } else if (images && Array.isArray(images)) {
    imageUrls = images;
  }
  
  // Update the order
  order.status = 'return_requested';
  order.return = {
    requestDate: new Date(),
    status: 'pending',
    reason,
    images: imageUrls
  };
  
  if (req.file && req.file.filename) {
    order.return.unboxingVideo = req.file.filename;
  }
  
  await order.save();
  
  // Notify admin about the return request
  try {
    const adminUsers = await User.find({ role: 'admin' });
    
    for (const admin of adminUsers) {
      await sendEmail({
        email: admin.email,
        subject: 'New Return Request',
        message: `A new return request has been submitted for order ${order._id}. Please review it in the admin panel.`
      });
    }
  } catch (error) {
    console.error('Email error:', error);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Process return request (admin)
exports.processReturn = catchAsync(async (req, res, next) => {
  const { status, adminNotes } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }
  
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the order is in return_requested status
  if (order.status !== 'return_requested') {
    return next(new AppError('This order is not in return_requested status', 400));
  }
  
  // Update the order
  order.status = status === 'approved' ? 'return_approved' : 'return_rejected';
  
  if (!order.return) {
    order.return = {};
  }
  
  order.return.status = status;
  order.return.adminNotes = adminNotes;
  order.return.processedBy = req.user._id;
  order.return.processedAt = new Date();
  
  await order.save();
  
  // Send email notification to the customer
  try {
    const user = await User.findById(order.user);
    
    if (user) {
      const subject = status === 'approved' 
        ? 'Your Return Request Has Been Approved' 
        : 'Your Return Request Has Been Rejected';
      
      let message = status === 'approved'
        ? `Your return request for order ${order._id} has been approved. Please ship the items back to us.`
        : `Your return request for order ${order._id} has been rejected.`;
      
      if (adminNotes) {
        message += ` Admin notes: ${adminNotes}`;
      }
      
      await sendEmail({
        email: user.email,
        subject,
        message
      });
    }
  } catch (error) {
    console.error('Email error:', error);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Submit return shipping information (customer)
exports.submitReturnShipping = catchAsync(async (req, res, next) => {
  const { expeditionService, trackingNumber } = req.body;
  
  if (!expeditionService || !trackingNumber) {
    return next(new AppError('Please provide expedition service and tracking number', 400));
  }
  
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the order belongs to the current user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to update this order', 403));
  }
  
  // Check if the order is in return_approved status
  if (order.status !== 'return_approved') {
    return next(new AppError('This order is not in return_approved status', 400));
  }
  
  // Update the order
  order.status = 'return_shipped';
  
  if (!order.return) {
    order.return = {};
  }
  
  order.return.expedition = {
    service: expeditionService,
    trackingNumber: trackingNumber,
    date: new Date()
  };
  
  await order.save();
  
  // Notify admin about the return shipment
  try {
    const adminUsers = await User.find({ role: 'admin' });
    
    for (const admin of adminUsers) {
      await sendEmail({
        email: admin.email,
        subject: 'Return Shipment Information Updated',
        message: `A customer has submitted return shipping information for order ${order._id}. Expedition service: ${expeditionService}, Tracking number: ${trackingNumber}.`
      });
    }
  } catch (error) {
    console.error('Email error:', error);
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Get order statistics (admin)
exports.getOrderStats = catchAsync(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  // Get total order count and revenue
  const totals = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      stats,
      totals: totals[0]
    }
  });
});

// Get return statistics (admin)
exports.getReturnStats = catchAsync(async (req, res) => {
  const returnStats = await Order.aggregate([
    {
      $match: {
        status: { $in: ['return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_rejected', 'returned'] }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      returnStats
    }
  });
});

// Get all return requests (admin)
exports.getReturns = catchAsync(async (req, res) => {
  const returns = await Order.find({
    status: { $in: ['return_requested', 'return_approved', 'return_shipped', 'return_received', 'return_rejected', 'returned'] }
  })
    .populate('user', 'name email')
    .populate('items.product', 'name price images')
    .populate('shippingAddress')
    .populate('return.processedBy', 'name')
    .sort({ 'return.requestDate': -1 });
  
  res.status(200).json({
    status: 'success',
    results: returns.length,
    data: {
      returns
    }
  });
});

// Check if user can return an order
exports.checkCanReturn = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  // Check if the order belongs to the current user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to return this order', 403));
  }
  
  // Check if the order is in delivered status and within the return window (14 days)
  const canReturn = 
    order.status === 'accepted' && 
    new Date() - new Date(order.customerAcceptedAt) < 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
  
  res.status(200).json({
    status: 'success',
    data: {
      canReturn,
      reason: !canReturn ? 'Order is not eligible for return' : null
    }
  });
});

// Get order details (admin)
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email phone')
    .populate('items.product', 'name price images stock')
    .populate('shippingAddress')
    .populate('paymentConfirmedBy', 'name')
    .populate('return.processedBy', 'name');
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});