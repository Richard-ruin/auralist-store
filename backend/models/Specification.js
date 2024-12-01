// models/Specification.js
const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'boolean', 'varchar'],  // Tambahkan 'varchar'
    default: 'text'
  },
  unit: {
    type: String,
    trim: true
  },
  options: [{
    type: String
  }],
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Indexes
specificationSchema.index({ category: 1, order: 1 });
specificationSchema.index({ name: 1, category: 1 }, { unique: true });

// Middleware untuk validasi
specificationSchema.pre('save', function(next) {
  // Jika type adalah 'select' tapi tidak ada options
  if (this.type === 'select' && (!this.options || this.options.length === 0)) {
    next(new Error('Select type specification must have options'));
  }
  next();
});

module.exports = mongoose.model('Specification', specificationSchema);