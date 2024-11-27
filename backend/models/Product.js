const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information (sesuai dengan yang ditampilkan di table)
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
  
  // Images (untuk product image di table)
  images: [{
    type: String,
    required: true
  }],
  mainImage: {
    type: String,
    required: true
  },

  // Additional Fields untuk fitur filter dan search
  slug: {
    type: String,
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  
  // Fields untuk inventory management
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
  comparePrice: Number, // untuk diskon/harga sebelum diskon
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // Timestamps
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

// Indexes untuk search functionality
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

// Method untuk update stock
productSchema.methods.updateStock = async function(quantity, operation = 'decrease') {
  const modifier = operation === 'decrease' ? -1 : 1;
  this.stock += (quantity * modifier);
  await this.save();
  return this;
};

// Virtual untuk hitung margin
productSchema.virtual('margin').get(function() {
  return ((this.price - this.costPrice) / this.price) * 100;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;