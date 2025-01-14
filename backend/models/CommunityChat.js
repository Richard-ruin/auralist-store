const mongoose = require('mongoose');

const communityChatSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderators: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const CommunityChat = mongoose.model('CommunityChat', communityChatSchema);
module.exports = CommunityChat;