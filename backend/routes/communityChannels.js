// backend/routes/communityChannels.js
const express = require('express');
const router = express.Router();
const communityChannelController = require('../controllers/communityChannelController');
const { protect, restrictTo } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (for logged-in users)
router.get('/', communityChannelController.getAllChannels);
router.post('/:id/join', communityChannelController.joinChannel);
router.delete('/:id/leave', communityChannelController.leaveChannel);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', communityChannelController.createChannel);
router.patch('/:id', communityChannelController.updateChannel);
router.delete('/:id', communityChannelController.deleteChannel);

module.exports = router;