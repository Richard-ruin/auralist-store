const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  messageType: {
    type: String,
    enum: ['user', 'admin', 'bot', 'community'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String, // URL atau path ke file
    optional: true
  }],
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
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