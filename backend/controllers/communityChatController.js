const CommunityChat = require('../models/CommunityChat');
const ChatMessage = require('../models/ChatMessage');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getChannels = catchAsync(async (req, res) => {
  const channels = await CommunityChat.find({ isActive: true })
    .populate('moderators', 'name avatar')
    .select('channel description participants');

  res.status(200).json({
    status: 'success',
    data: { channels }
  });
});

exports.joinChannel = catchAsync(async (req, res) => {
  const { channelId } = req.params;
  
  const channel = await CommunityChat.findById(channelId);
  if (!channel) {
    return next(new AppError('Channel not found', 404));
  }

  // Check if user already joined
  const alreadyJoined = channel.participants.some(
    p => p.user.toString() === req.user._id.toString()
  );

  if (!alreadyJoined) {
    channel.participants.push({ user: req.user._id });
    await channel.save();
  }

  res.status(200).json({
    status: 'success',
    data: { channel }
  });
});

exports.leaveChannel = catchAsync(async (req, res) => {
  const { channelId } = req.params;
  
  await CommunityChat.findByIdAndUpdate(channelId, {
    $pull: { participants: { user: req.user._id } }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getChannelMessages = catchAsync(async (req, res) => {
  const { channelId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await ChatMessage.find({
    roomId: channelId,
    messageType: 'community',
    isDeleted: false
  })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar');

  res.status(200).json({
    status: 'success',
    data: { messages }
  });
});

// Admin only endpoints
exports.createChannel = catchAsync(async (req, res) => {
  const { channel, description } = req.body;

  const newChannel = await CommunityChat.create({
    channel,
    description,
    moderators: [req.user._id]
  });

  res.status(201).json({
    status: 'success',
    data: { channel: newChannel }
  });
});

exports.updateChannel = catchAsync(async (req, res) => {
  const { channelId } = req.params;
  const { channel, description, isActive } = req.body;

  const updatedChannel = await CommunityChat.findByIdAndUpdate(
    channelId,
    { channel, description, isActive },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: { channel: updatedChannel }
  });
});