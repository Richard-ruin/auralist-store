// controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate({
      path: 'products',
      select: 'name brand price images stock status mainImage',
      populate: {
        path: 'brand',
        select: 'name'
      }
    });

  if (!wishlist) {
    return res.json({ products: [] });
  }

  // Format the response to match frontend expectations
  const formattedProducts = wishlist.products.map(product => ({
    id: product._id,
    name: product.name,
    brand: product.brand.name,
    price: product.price,
    image: product.mainImage,
    inStock: product.status === 'In Stock'
  }));

  res.json(formattedProducts);
});

exports.addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, products: [] });
  }

  // Add product if not already in wishlist
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.status(201).json({
    status: 'success',
    message: 'Product added to wishlist'
  });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  wishlist.products = wishlist.products.filter(
    product => product.toString() !== productId
  );
  await wishlist.save();

  res.json({
    status: 'success',
    message: 'Product removed from wishlist'
  });
});

exports.clearWishlist = catchAsync(async (req, res) => {
  await Wishlist.findOneAndUpdate(
    { user: req.user.id },
    { $set: { products: [] } },
    { new: true }
  );

  res.json({
    status: 'success',
    message: 'Wishlist cleared'
  });
});