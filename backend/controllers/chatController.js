// controllers/chatController.js
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Chat room management
// controllers/chatController.js
exports.createChatRoom = catchAsync(async (req, res, next) => {
  const { name, type, participantIds = [] } = req.body;

  if (!name || !type) {
    return next(new AppError('Name and type are required', 400));
  }

  // For admin type, ensure only one room per user
  if (type === 'admin') {
    const existingRoom = await ChatRoom.findOne({
      type: 'admin',
      'participants.user': req.user._id,
      isActive: true
    });

    if (existingRoom) {
      return res.status(200).json({
        status: 'success',
        data: { room: existingRoom }
      });
    }

    // If no active room exists, deactivate any old rooms
    await ChatRoom.updateMany(
      {
        type: 'admin',
        'participants.user': req.user._id
      },
      {
        isActive: false
      }
    );
  }

  const participants = [
    { user: req.user._id, role: 'user' },
    ...participantIds.map(id => ({ user: id, role: 'user' }))
  ];

  const room = await ChatRoom.create({
    name,
    type,
    participants,
    isActive: true
  });

  await room.populate('participants.user', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: { room }
  });
});

exports.getChatRooms = catchAsync(async (req, res) => {
  const { type } = req.query;
  const query = {
    isActive: true
  };
  
  if (type && type !== 'all') {
    query.type = type;
  }

  // Add participant filter to only get rooms user is part of
  query['participants.user'] = req.user._id;

  const rooms = await ChatRoom.find(query)
    .populate('participants.user', 'name avatar')
    .populate('lastMessage')
    .sort('-updatedAt');

  res.status(200).json({
    status: 'success',
    data: { rooms }
  });
});
exports.sendChannelMessage = catchAsync(async (req, res, next) => {
  const { channelId } = req.params;
  const { content } = req.body;

  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  // Create message
  const message = await ChatMessage.create({
    sender: req.user._id,
    roomId: channelId,
    content,
    messageType: 'community'
  });

  // Populate sender info
  await message.populate([
    { path: 'sender', select: 'name avatar' }
  ]);

  // Emit to channel
  const io = req.app.get('io');
  if (io) {
    console.log('Emitting message to channel:', channelId);
    io.to(`channel:${channelId}`).emit('newMessage', message);
  }

  res.status(201).json({
    status: 'success',
    data: { message }
  });
});
// Regular chat message
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { content } = req.body;

  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  // Check room exists and user is participant
  const room = await ChatRoom.findOne({
    _id: roomId,
    'participants.user': req.user._id
  });

  if (!room) {
    return next(new AppError('Chat room not found or access denied', 404));
  }

  const message = await ChatMessage.create({
    sender: req.user._id,
    roomId: room._id,
    content,
    messageType: room.type
  });

  // Update last message
  room.lastMessage = message._id;
  await room.save();

  // Populate sender info
  await message.populate('sender', 'name avatar');

  // Emit to room
  const io = req.app.get('io');
  if (io) {
    io.to(`room:${roomId}`).emit('newMessage', message);
  }

  res.status(201).json({
    status: 'success',
    data: { message }
  });
});

// Channel specific message handler
exports.sendChannelMessage = catchAsync(async (req, res, next) => {
  const { channelId } = req.params;
  const { content } = req.body;

  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  // Create message
  const message = await ChatMessage.create({
    sender: req.user._id,
    roomId: channelId,
    content,
    messageType: 'community'
  });

  // Populate sender info
  await message.populate('sender', 'name avatar');

  // Emit to channel
  const io = req.app.get('io');
  if (io) {
    io.to(`channel:${channelId}`).emit('newMessage', message);
  }

  res.status(201).json({
    status: 'success',
    data: { message }
  });
});

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await ChatMessage.find({
    roomId,
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

exports.markMessagesAsRead = catchAsync(async (req, res) => {
  const { roomId } = req.params;

  await ChatMessage.updateMany(
    {
      roomId,
      'readBy.user': { $ne: req.user._id }
    },
    {
      $push: {
        readBy: { user: req.user._id, readAt: new Date() }
      }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read'
  });
});