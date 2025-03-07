// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const http = require('http'); // Tambahkan ini
const socketIO = require('socket.io'); // Tambahkan ini
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const productRoutes = require('./routes/products');
const specificationRoutes = require('./routes/specifications');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const addressRoutes = require('./routes/address');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');
const chatBotRoutes = require('./routes/chatBot');
const communityChannelRoutes = require('./routes/communityChannels');
const reportRoutes = require('./routes/report');
const { ExpeditionService, createInitialServices } = require('./models/ExpeditionService');
const expeditionRoutes = require('./routes/expeditionService');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
const chatBotController = require('./controllers/chatBotController');
chatBotController.initializeDefaultResponses();
// Create necessary directories
const createRequiredDirectories = () => {
  const directories = [
    path.join(__dirname, 'public/images/reviews'),
    path.join(__dirname, 'public/images/payments'),
    path.join(__dirname, 'public/uploads/profiles'),
    path.join(__dirname, 'public/images/expeditions')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Email configuration verification
const verifyEmailConfig = async () => {
  try {
    console.log('Verifying email configuration...');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const verify = await transporter.verify();
    console.log('Email configuration verified:', verify);
  } catch (error) {
    console.error('Email configuration error:', error);
  }
};

// Create Express app
const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Create required directories
createRequiredDirectories();

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Make sure to import and call this function
    const { createInitialServices } = require('./models/ExpeditionService');
    await createInitialServices();
  })
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files middleware
app.use('/api/images/reviews', express.static(path.join(__dirname, 'public/images/reviews')));
app.use('/api/images', (req, res, next) => {
  console.log('Image request path:', req.path);
  console.log('Full URL:', req.originalUrl);
  next();
}, express.static(path.join(__dirname, 'public/images')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'public/uploads/profiles')));

app.use('/uploads', express.static('public/uploads'));
app.use('/api/uploads/returns/images', express.static(path.join(__dirname, 'public/uploads/returns/images')));
app.use('/api/uploads/returns/videos', express.static(path.join(__dirname, 'public/uploads/returns/videos')));

// Socket.IO Authentication Middleware
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

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.user?.name);

  // Join personal room
  if (socket.user) {
    socket.join(`user:${socket.user._id}`);
  }

  // Handle joining community channel
  socket.on('joinChannel', (channelId) => {
    socket.join(`channel:${channelId}`);
    console.log(`User ${socket.user?.name} joined channel ${channelId}`);
  });

  // Handle leaving community channel
  socket.on('leaveChannel', (channelId) => {
    socket.leave(`channel:${channelId}`);
    console.log(`User ${socket.user?.name} left channel ${channelId}`);
  });

  // Handle community messages
  socket.on('communityMessage', async ({ channelId, message }) => {
    console.log(`New message in channel ${channelId}:`, message);
    io.to(`channel:${channelId}`).emit('newMessage', message);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user?.name);
  });
});

// Verify email configuration
verifyEmailConfig();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/specifications', specificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbot', chatBotRoutes);
app.use('/api/community/channels', communityChannelRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expedition-services', expeditionRoutes);
app.set('io', io);

// Error handling
app.use(errorHandler);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    } : {}
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});