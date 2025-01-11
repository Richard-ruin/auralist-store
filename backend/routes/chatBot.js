const express = require('express');
const router = express.Router();
const chatBotController = require('../controllers/chatBotController');
const { protect, restrictTo } = require('../middleware/auth');

// Generate bot response
router.post(
  '/response',
  protect,
  chatBotController.generateResponse
);

// Admin routes for managing bot responses
router.use(protect, restrictTo('admin'));

router.route('/responses')
  .get(chatBotController.getBotResponses)
  .post(chatBotController.createBotResponse);

router.route('/responses/:id')
  .patch(chatBotController.updateBotResponse)
  .delete(chatBotController.deleteBotResponse);

module.exports = router;