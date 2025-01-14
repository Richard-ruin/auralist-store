// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadChat');

router.use(protect);

// Chat room routes
router.get('/rooms', chatController.getChatRooms);
router.post('/rooms', chatController.createChatRoom);

// Message routes - Unified message handling for both rooms and channels
router.get('/rooms/:roomId/messages', chatController.getChatMessages);
router.post('/rooms/:roomId/messages', chatController.sendMessage);
router.post('/channels/:channelId/messages', chatController.sendChannelMessage); // Separate handler for channel messages
router.post('/rooms/:roomId/read', chatController.markMessagesAsRead);

module.exports = router;