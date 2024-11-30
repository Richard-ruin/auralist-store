// models/Product.js
const mongoose = require('mongoose');

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

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Stock must be a whole number'
    }
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  
  // Images
  images: [{
    type: String,
    required: true
  }],
  mainImage: {
    type: String,
    required: true
  },

  // Specifications
  specifications: [specificationValueSchema],

  // SEO and Filters
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  
  // Inventory Management
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  stockStatus: {
    type: String,
    enum: ['Available', 'Limited', 'Unavailable'],
    default: 'Available'
  },

  // Pricing
  comparePrice: Number,
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1, sku: 1 });

// Pre-save hook untuk update status berdasarkan stock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.status = 'Out of Stock';
    this.stockStatus = 'Unavailable';
  } else if (this.stock <= this.lowStockThreshold) {
    this.status = 'Low Stock';
    this.stockStatus = 'Limited';
  } else {
    this.status = 'In Stock';
    this.stockStatus = 'Available';
  }
  next();
});

// Virtual untuk margin
productSchema.virtual('margin').get(function() {
  return ((this.price - this.costPrice) / this.price) * 100;
});

// Method untuk validasi spesifikasi
productSchema.methods.validateSpecifications = async function() {
  const Specification = mongoose.model('Specification');
  
  // Get required specifications for this category
  const requiredSpecs = await Specification.find({
    category: this.category,
    isRequired: true
  });
  
  // Check if all required specifications are present
  const specIds = this.specifications.map(spec => spec.specification.toString());
  const missingSpecs = requiredSpecs.filter(spec => 
    !specIds.includes(spec._id.toString())
  );
  
  if (missingSpecs.length > 0) {
    throw new Error(`Missing required specifications: ${
      missingSpecs.map(spec => spec.displayName).join(', ')
    }`);
  }
  
  return true;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;