// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/uploadChat');

router.use(protect);

// Admin routes
router.post(
  '/admin/initialize/:userId',
  restrictTo('admin'),
  chatController.initializeAdminChat
);

// Chat room routes
router.get('/rooms', chatController.getChatRooms);
router.post('/rooms', chatController.createChatRoom);
router.get('/rooms/:roomId/messages', chatController.getChatMessages);
router.post('/rooms/:roomId/messages', chatController.sendMessage);
router.post('/rooms/:roomId/read', chatController.markMessagesAsRead);

module.exports = router;