// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard', 'bri', 'bca', 'mandiri'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'IDR'],
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'expired', 'confirmed', 'rejected'],
    default: 'pending'
  },
  proofImage: {
    type: String,
    required: true
  },
  expiredAt: {
    type: Date,
    required: true
  },
  confirmedAt: Date,
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

// Set expired time 5 minutes from creation
paymentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.expiredAt = new Date(Date.now() + 5 * 60 * 1000);
  }
  next();
});

// Set currency based on payment method
paymentSchema.pre('save', function(next) {
  if (this.isModified('paymentMethod')) {
    this.currency = ['visa', 'mastercard'].includes(this.paymentMethod) ? 'USD' : 'IDR';
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;