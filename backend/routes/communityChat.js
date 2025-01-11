const express = require('express');
const router = express.Router();
const communityChatController = require('../controllers/communityChatController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Public routes (for logged-in users)
router.get('/channels', communityChatController.getChannels);
router.post('/channels/:channelId/join', communityChatController.joinChannel);
router.delete('/channels/:channelId/leave', communityChatController.leaveChannel);
router.get('/channels/:channelId/messages', communityChatController.getChannelMessages);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/channels', communityChatController.createChannel);
router.patch('/channels/:channelId', communityChatController.updateChannel);

module.exports = router;