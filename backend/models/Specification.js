// models/Specification.js
const mongoose = require('mongoose');

// Schema untuk tiap nilai spesifikasi pada produk
const specificationValueSchema = new mongoose.Schema({
  specification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specification',
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

// Schema utama untuk Specification
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
    enum: ['string', 'textarea', 'number', 'select', 'boolean'],
    default: 'string'
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

// Index untuk pencarian dan pengurutan
specificationSchema.index({ category: 1, order: 1 });
specificationSchema.index({ name: 1, category: 1 }, { unique: true });

// Statics method untuk mendapatkan spesifikasi by category
specificationSchema.statics.findByCategory = function(categoryId) {
  return this.find({ 
    category: categoryId,
    status: 'Active' 
  }).sort('order');
};

const Specification = mongoose.model('Specification', specificationSchema);
const SpecificationValue = mongoose.model('SpecificationValue', specificationValueSchema);

module.exports = { Specification, SpecificationValue };