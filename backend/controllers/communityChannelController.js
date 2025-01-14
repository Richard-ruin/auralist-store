// backend/controllers/communityChannelController.js
const CommunityChannel = require('../models/CommunityChannel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all channels
exports.getAllChannels = catchAsync(async (req, res) => {
  const channels = await CommunityChannel.find({ isActive: true })
    .populate('createdBy', 'name')
    .select('channel description participants');

  res.status(200).json({
    status: 'success',
    data: {
      channels
    }
  });
});

// Create new channel
exports.createChannel = catchAsync(async (req, res, next) => {
  const { channel, description } = req.body;

  // Check if channel already exists
  const existingChannel = await CommunityChannel.findOne({ channel });
  if (existingChannel) {
    return next(new AppError('Channel name already exists', 400));
  }

  const newChannel = await CommunityChannel.create({
    channel,
    description,
    createdBy: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      channel: newChannel
    }
  });
});

// Update channel
exports.updateChannel = catchAsync(async (req, res, next) => {
  const { channel, description, isActive } = req.body;
  const channelId = req.params.id;

  const updatedChannel = await CommunityChannel.findByIdAndUpdate(
    channelId,
    { channel, description, isActive },
    { new: true, runValidators: true }
  );

  if (!updatedChannel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      channel: updatedChannel
    }
  });
});

// Delete channel
exports.deleteChannel = catchAsync(async (req, res, next) => {
  const channelId = req.params.id;

  const channel = await CommunityChannel.findByIdAndDelete(channelId);

  if (!channel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Join channel
exports.joinChannel = catchAsync(async (req, res, next) => {
  const channelId = req.params.id;
  const userId = req.user._id;

  const channel = await CommunityChannel.findById(channelId);
  if (!channel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  // Check if user already joined
  const alreadyJoined = channel.participants.some(
    p => p.user.toString() === userId.toString()
  );

  if (!alreadyJoined) {
    channel.participants.push({ user: userId });
    await channel.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      channel
    }
  });
});

// Leave channel
exports.leaveChannel = catchAsync(async (req, res, next) => {
  const channelId = req.params.id;
  const userId = req.user._id;

  const channel = await CommunityChannel.findByIdAndUpdate(
    channelId,
    { $pull: { participants: { user: userId } } },
    { new: true }
  );

  if (!channel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      channel
    }
  });
});