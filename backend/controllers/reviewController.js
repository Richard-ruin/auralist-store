const Review = require('../models/Review');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Di reviewController.js, perbaiki createReview:
exports.createReview = catchAsync(async (req, res, next) => {
  const productId = req.body.product; // Ubah dari productId ke product

  // Cek order yang accepted dengan product ini
  const order = await Order.findOne({
    user: req.user.id,
    status: 'accepted',
    'items.product': productId // Perbaiki query untuk mencari product di items
  });

  console.log('Found order:', order);

  if (!order) {
    return next(new AppError('You can only review products from accepted orders', 400));
  }

  // Cek jika user sudah review product ini
  const existingReview = await Review.findOne({
    user: req.user.id,
    product: productId
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  // Buat review dengan uploaded image paths
  const reviewData = {
    user: req.user.id,
    product: productId,
    order: order._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    images: req.files ? req.files.map(file => file.filename) : []
  };

  const review = await Review.create(reviewData);
  await review.populate('user', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});
exports.checkCanReview = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  console.log('checkCanReview called:', {
    productId,
    userId,
    user: req.user
  });

  // Cek existing review
  const existingReview = await Review.findOne({
    user: userId,
    product: productId
  });

  console.log('Existing review:', existingReview);

  if (existingReview) {
    return res.status(200).json({
      status: 'success',
      canReview: false,
      message: 'You have already reviewed this product'
    });
  }

  // Cek accepted order dengan $elemMatch untuk memastikan product ada di items
  const order = await Order.findOne({
    user: userId,
    status: 'accepted',
    items: {
      $elemMatch: {
        product: productId
      }
    }
  });

  console.log('Found accepted order:', order);

  const canReview = Boolean(order);

  res.status(200).json({
    status: 'success',
    canReview,
    message: order 
      ? 'You can review this product'
      : 'You need to purchase and receive this product first',
    debug: {
      userId,
      productId,
      hasOrder: !!order
    }
  });
});
// Di reviewController.js, update getAllReviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query = Review.find({ product: req.query.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  // Execute query
  const reviews = await query;
  const total = await Review.countDocuments({ product: req.query.productId });

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: total
    }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this review', 403));
  }

  // Update review data
  const updateData = {
    ...req.body,
    edited: true,
    editedAt: Date.now()
  };

  // Handle image updates if new images are uploaded
  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map(file => file.filename);
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('user', 'name avatar');

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview
    }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  await review.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.toggleLike = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const userId = req.user.id;

  // Remove from dislikes if exists
  const dislikeIndex = review.dislikes.indexOf(userId);
  if (dislikeIndex > -1) {
    review.dislikes.splice(dislikeIndex, 1);
  }

  // Toggle like
  const likeIndex = review.likes.indexOf(userId);
  if (likeIndex > -1) {
    review.likes.splice(likeIndex, 1);
  } else {
    review.likes.push(userId);
  }

  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.toggleDislike = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const userId = req.user.id;

  // Remove from likes if exists
  const likeIndex = review.likes.indexOf(userId);
  if (likeIndex > -1) {
    review.likes.splice(likeIndex, 1);
  }

  // Toggle dislike
  const dislikeIndex = review.dislikes.indexOf(userId);
  if (dislikeIndex > -1) {
    review.dislikes.splice(dislikeIndex, 1);
  } else {
    review.dislikes.push(userId);
  }

  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});