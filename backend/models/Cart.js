// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  // Untuk menyimpan harga saat item ditambahkan ke cart
  priceAtTime: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method untuk menghitung total
cartSchema.methods.calculateTotals = function() {
  const totals = this.items.reduce((acc, item) => {
    acc.amount += item.price * item.quantity;
    acc.items += item.quantity;
    return acc;
  }, { amount: 0, items: 0 });

  this.totalAmount = totals.amount;
  this.totalItems = totals.items;

  return this;
};

// Pre save middleware untuk update totals
cartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotals();
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;