// Update User model
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: String,
  name: String,
  googleId: String,
  githubId: String,
  facebookId: String,
  role: { 
    type: String, 
    enum: ['admin', 'customer'], 
    default: 'customer' 
  },
  phoneNumber: String,
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = {
  Product: mongoose.model('Product', productSchema),
  Category: mongoose.model('Category', categorySchema),
  Order: mongoose.model('Order', orderSchema),
  Review: mongoose.model('Review', reviewSchema),
  User: mongoose.model('User', userSchema)
};