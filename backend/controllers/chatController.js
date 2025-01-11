const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getChatRooms = catchAsync(async (req, res) => {
  const rooms = await ChatRoom.find({
    'participants.user': req.user._id,
    isActive: true
  })
  .populate('lastMessage')
  .populate('participants.user', 'name avatar');

  res.status(200).json({
    status: 'success',
    data: { rooms }
  });
});

exports.createChatRoom = catchAsync(async (req, res) => {
  const { name, type, participantIds } = req.body;

  // Validate participants
  if (type === 'direct' && (!participantIds || participantIds.length !== 1)) {
    return next(new AppError('Direct chat requires exactly one participant', 400));
  }

  // Check for existing direct chat
  if (type === 'direct') {
    const existingRoom = await ChatRoom.findOne({
      type: 'direct',
      'participants.user': { 
        $all: [req.user._id, participantIds[0]]
      }
    });

    if (existingRoom) {
      return res.status(200).json({
        status: 'success',
        data: { room: existingRoom }
      });
    }
  }

  // Create participants array
  const participants = [
    { user: req.user._id, role: 'user' },
    ...participantIds.map(id => ({ user: id, role: 'user' }))
  ];

  const room = await ChatRoom.create({
    name,
    type,
    participants
  });

  res.status(201).json({
    status: 'success',
    data: { room }
  });
});

exports.getChatMessages = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Check room access
  const room = await ChatRoom.findOne({
    _id: roomId,
    'participants.user': req.user._id
  });

  if (!room) {
    return next(new AppError('Chat room not found or access denied', 404));
  }

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

exports.sendMessage = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { content, messageType } = req.body;

  // Check room access
  const room = await ChatRoom.findOne({
    _id: roomId,
    'participants.user': req.user._id
  });

  if (!room) {
    return next(new AppError('Chat room not found or access denied', 404));
  }

  const message = await ChatMessage.create({
    sender: req.user._id,
    roomId,
    content,
    messageType,
    readBy: [{ user: req.user._id }]
  });

  // Update room's last message
  room.lastMessage = message._id;
  await room.save();

  // Emit socket event
  req.app.get('io').to(`room:${roomId}`).emit('newMessage', message);

  res.status(201).json({
    status: 'success',
    data: { message }
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