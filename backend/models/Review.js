const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return this.images.length <= 3;
      },
      message: 'Maximum 3 images allowed'
    }
  }],
  video: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual for likes count
reviewSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for dislikes count
reviewSchema.virtual('dislikesCount').get(function() {
  return this.dislikes.length;
});

// Method to check if review can be edited by user
reviewSchema.methods.canBeEditedBy = function(userId) {
  return this.user.toString() === userId.toString();
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;