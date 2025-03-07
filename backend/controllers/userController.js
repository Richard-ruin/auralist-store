// backend/controllers/userController.js
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Search functionality
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by activity (based on last login)
  if (req.query.activity) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (req.query.activity === 'active') {
      query.lastLogin = { $gte: thirtyDaysAgo };
    } else if (req.query.activity === 'inactive') {
      query.lastLogin = { $lt: thirtyDaysAgo };
    }
  }

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .select('-password');

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: {
      users
    }
  });
});
exports.getMe = catchAsync(async (req, res, next) => {
  // User is already available in req.user from the protect middleware
  res.status(200).json({
    status: 'success',
    data: req.user
  });
});
exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  user.avatar = req.file.filename; // Just store the filename
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      avatar: user.avatar
    }
  });
});
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { status, reason } = req.body;
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Add to status history
  user.statusHistory.push({
    status,
    changedBy: req.user._id,
    reason,
    timestamp: new Date()
  });

  // Update current status
  user.status = status;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getUserStatusHistory = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'statusHistory.changedBy',
      select: 'name email'
    });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      statusHistory: user.statusHistory
    }
  });
});

exports.resetToGeneratedAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const { generateAvatar } = require('../utils/helpers');
  const generatedAvatar = generateAvatar(user.name);
  user.avatar = generatedAvatar; // Store the complete data URL
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      avatar: user.avatar
    }
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUserStats = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
  const newThisMonth = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) }
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      activeUsers,
      newThisMonth
    }
  });
});