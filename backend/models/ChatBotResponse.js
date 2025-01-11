const mongoose = require('mongoose');

const chatBotResponseSchema = new mongoose.Schema({
  keywords: [{
    type: String,
    required: true
  }],
  response: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['faq', 'product', 'shipping', 'payment', 'general'],
    required: true
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ChatBotResponse = mongoose.model('ChatBotResponse', chatBotResponseSchema);
module.exports = ChatBotResponse;