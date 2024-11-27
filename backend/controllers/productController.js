// controllers/productController.js
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// controllers/productController.js
exports.createProduct = async (req, res) => {
  try {
    // Debug log
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);

    // Validate files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload at least one image',
        debug: { body: req.body, files: req.files }
      });
    }

    // Process images
    const images = req.files.map(file => `/images/products/${file.filename}`);
    const mainImage = images[0];

    // Create product data
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status,
      images: images,
      mainImage: mainImage,
      slug: slugify(req.body.name, { lower: true }),
      createdBy: req.user._id
    };

    const product = await Product.create(productData);

    // Update related collections
    await Promise.all([
      Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: 1 } }),
      Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } })
    ]);

    res.status(201).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
      debug: { error: error.stack }
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = Product.find()
      .populate('brand', 'name')
      .populate('category', 'name');

    // Search functionality
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // Filter by status
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      let priceFilter = {};
      if (req.query.minPrice) priceFilter.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.$lte = parseFloat(req.query.maxPrice);
      query = query.find({ price: priceFilter });
    }

    // Apply pagination
    const total = await Product.countDocuments(query);
    const products = await query.skip(skip).limit(limit);

    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand')
      .populate('category')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    // Handle image updates if new files are uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '../public', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

      // Add new images
      const images = req.files.map(file => `/images/products/${file.filename}`);
      req.body.images = images;
      req.body.mainImage = images[0];
    }

    // Update slug if name changes
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    // Delete associated images
    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '../public', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    // Update related collections
    await Promise.all([
      Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: -1 } }),
      Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } })
    ]);

    await product.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};