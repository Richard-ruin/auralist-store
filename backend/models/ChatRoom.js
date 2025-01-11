const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['direct', 'community', 'bot', 'admin'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'bot'],
      default: 'user'
    }
  }],
  lastMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'ChatMessage'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = ChatRoom;