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

// controllers/chatController.js
// controllers/chatController.js
exports.getChatRooms = catchAsync(async (req, res) => {
  const { type } = req.query;
  let query = {};
  
  // Add type filter if specified
  if (type && type !== 'all') {
    query.type = type;
  }

  // For admins, show all rooms of specified type
  // For regular users, only show rooms they're part of
  if (req.user.role !== 'admin') {
    query['participants.user'] = req.user._id;
  }

  console.log('Finding rooms with query:', query); // Debug log

  const rooms = await ChatRoom.find(query)
    .populate({
      path: 'participants.user',
      select: 'name email avatar'
    })
    .populate({
      path: 'lastMessage',
      select: 'content createdAt sender'
    })
    .sort('-updatedAt');

  console.log('Found rooms:', rooms); // Debug log

  res.status(200).json({
    status: 'success',
    data: { rooms }
  });
});

// controllers/chatController.js
exports.initializeAdminChat = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Cari room yang sudah ada
  let room = await ChatRoom.findOne({
    type: 'admin',
    'participants.user': userId
  });

  // Jika tidak ada room, buat baru
  if (!room) {
    room = await ChatRoom.create({
      name: 'Admin Support',
      type: 'admin',
      participants: [
        { user: userId, role: 'user' },
        { user: req.user._id, role: 'admin' }
      ],
      isActive: true
    });
  } else {
    // Jika room ada tapi admin belum jadi participant, tambahkan
    const adminExists = room.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    );

    if (!adminExists) {
      room.participants.push({
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      });
      await room.save();
    }
  }

  await room.populate([
    {
      path: 'participants.user',
      select: 'name email avatar'
    },
    {
      path: 'lastMessage',
      select: 'content createdAt sender'
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { room }
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

  console.log('Attempting to send message. RoomId:', roomId);
  console.log('Current user:', req.user._id);

  // Cari room dan jika admin, tambahkan sebagai participant jika belum ada
  let room = await ChatRoom.findById(roomId);

  if (!room) {
    return next(new AppError('Chat room not found', 404));
  }

  // Jika user adalah admin, tambahkan sebagai participant jika belum ada
  if (req.user.role === 'admin') {
    const isParticipant = room.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      room.participants.push({
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      });
      await room.save();
    }
  } else {
    // Untuk non-admin, cek participation seperti biasa
    const isParticipant = room.participants.some(p => 
      p.user.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      return next(new AppError('You are not a participant in this chat room', 403));
    }
  }

  // Buat pesan
  const message = await ChatMessage.create({
    sender: req.user._id,
    roomId: room._id,
    content,
    messageType: room.type
  });

  // Update lastMessage
  room.lastMessage = message._id;
  await room.save();

  // Populate sender info
  await message.populate('sender', 'name avatar');

  // Emit socket event
  if (req.app.get('io')) {
    req.app.get('io').to(`room:${roomId}`).emit('newMessage', message);
  }

  res.status(201).json({
    status: 'success',
    data: { message }
  });
});

exports.createOrGetAdminRoom = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  // Cari room yang sudah ada
  let room = await ChatRoom.findOne({
    type: 'admin',
    'participants': {
      $all: [
        { $elemMatch: { user: userId, role: 'user' } },
        { $elemMatch: { user: req.user._id, role: 'admin' } }
      ]
    },
    isActive: true
  });

  // Jika tidak ada, buat room baru
  if (!room) {
    room = await ChatRoom.create({
      name: 'Admin Support',
      type: 'admin',
      participants: [
        { user: userId, role: 'user' },
        { user: req.user._id, role: 'admin' }
      ],
      isActive: true
    });
  }

  // Populate participant info
  await room.populate('participants.user', 'name email avatar');

  res.status(200).json({
    status: 'success',
    data: { room }
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