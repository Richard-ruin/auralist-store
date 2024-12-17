// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'name price stock mainImage brand status',
      populate: {
        path: 'brand',
        select: 'name'
      }
    });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
  }

  res.json({
    status: 'success',
    data: cart
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check stock
  if (product.stock < quantity) {
    return next(new AppError('Not enough stock available', 400));
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if total doesn't exceed stock
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      return next(new AppError('Requested quantity exceeds available stock', 400));
    }
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      priceAtTime: product.price
    });
  }

  await cart.save();

  // Populate cart items before sending response
  await cart.populate({
    path: 'items.product',
    select: 'name price stock mainImage brand status',
    populate: {
      path: 'brand',
      select: 'name'
    }
  });

  res.status(200).json({
    status: 'success',
    data: cart
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  // Validate quantity
  if (quantity < 0) {
    return next(new AppError('Quantity cannot be negative', 400));
  }

  // Check product stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (quantity > product.stock) {
    return next(new AppError('Requested quantity exceeds available stock', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new AppError('Item not found in cart', 404));
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity and price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
  }

  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name price stock mainImage brand status',
    populate: {
      path: 'brand',
      select: 'name'
    }
  });

  res.json({
    status: 'success',
    data: cart
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new AppError('Item not found in cart', 404));
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name price stock mainImage brand status',
    populate: {
      path: 'brand',
      select: 'name'
    }
  });

  res.json({
    status: 'success',
    data: cart
  });
});

exports.clearCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({
    status: 'success',
    message: 'Cart cleared successfully'
  });
});