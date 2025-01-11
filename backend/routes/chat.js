const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const uploadChat = require('../middleware/uploadChat');

// Protect all chat routes
router.use(protect);

// Chat rooms
router.get('/rooms', chatController.getChatRooms);
router.post('/rooms', chatController.createChatRoom);

// Messages
router.get('/rooms/:roomId/messages', chatController.getChatMessages);
router.post(
  '/rooms/:roomId/messages',
  uploadChat.array('attachments', 5),
  chatController.sendMessage
);
router.post('/rooms/:roomId/read', chatController.markMessagesAsRead);

module.exports = router;