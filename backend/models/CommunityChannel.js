// backend/models/CommunityChannel.js
const mongoose = require('mongoose');

const communityChannelSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const CommunityChannel = mongoose.model('CommunityChannel', communityChannelSchema);
module.exports = CommunityChannel;