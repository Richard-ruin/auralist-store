// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard', 'bri', 'bca', 'mandiri', 'pending']
  },
  currency: {
    type: String,
    enum: ['USD', 'IDR'],
    required: true,
    default: 'USD'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'processing',
      'confirmed',
      'being_packed',
      'managed_by_expedition',
      'shipped',
      'delivered',
      'accepted',
      'cancelled',
      'return_requested',
      'return_approved',
      'return_shipped',
      'return_received',
      'return_rejected',
      'returned'
    ],
    default: 'processing'
  },
  return: {
    requestDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'shipped', 'received'],
    },
    reason: String,
    images: [String], // Array of image URLs
    unboxingVideo: String,
    adminNotes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,
    expedition: {
      service: String,
      trackingNumber: String,
      date: Date
    }
  },
  paymentProof: {
    type: String
  },
  paymentExpiredAt: Date,
  paymentConfirmedAt: Date,
  paymentConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expedition: {
    service: String,
    trackingNumber: String,
    date: Date
  },
  customerAcceptedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Set currency based on payment method
orderSchema.pre('save', function(next) {
  if (this.isModified('paymentMethod')) {
    // If payment method is pending or card-based, use USD
    if (this.paymentMethod === 'pending' || 
        this.paymentMethod === 'visa' || 
        this.paymentMethod === 'mastercard') {
      this.currency = 'USD';
    } else {
      // For Indonesian banks
      this.currency = 'IDR';
    }
  }
  next();
});

// Add these indexes to optimize queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ user: 1, 'items.product': 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;