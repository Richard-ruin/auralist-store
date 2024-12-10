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
  // Di model Order, update shippingAddress
shippingAddress: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Address',
  required: true
},
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard', 'bri', 'bca', 'mandiri'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  currency: {
    type: String,
    enum: ['USD', 'IDR'],
    required: true,
    default: 'IDR'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
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
  trackingNumber: String,
  notes: String
}, {
  timestamps: true
});

// Set currency based on payment method
orderSchema.pre('save', function(next) {
  if (this.isModified('paymentMethod')) {
    this.currency = ['visa', 'mastercard'].includes(this.paymentMethod) ? 'USD' : 'IDR';
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;