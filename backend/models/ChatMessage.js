// Modified models/ChatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  messageType: {
    type: String,
    enum: ['direct', 'community', 'bot', 'admin'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    optional: true
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;