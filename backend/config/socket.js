const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Socket Connection Handler
  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.name);

    // Join personal room
    socket.join(`user:${socket.user._id}`);

    // Handle events here
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.name);
    });
  });

  return io;
};

module.exports = initializeSocket;