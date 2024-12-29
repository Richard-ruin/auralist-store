const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// CREATE PRODUCT
// controllers/productController.js
exports.getProductStats = catchAsync(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $facet: {
        categoryStats: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalStock: { $sum: '$stock' }
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category'
            }
          }
        ],
        stockAlert: [
          {
            $match: {
              $expr: {
                $lte: ['$stock', '$lowStockThreshold']
              }
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      categories: stats[0].categoryStats,
      lowStock: stats[0].stockAlert[0]?.count || 0
    }
  });
});
exports.createProduct = async (req, res) => {
  try {
    // Validate required files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload at least one image'
      });
    }

    // Process images
    const images = req.files.map(file => file.filename);
    const mainImage = images[0];

    // Create product data
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      costPrice: req.body.costPrice,
      stock: req.body.stock,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status || 'In Stock',
      lowStockThreshold: req.body.lowStockThreshold || 10,
      images: images,
      mainImage: mainImage,
      slug: slugify(req.body.name, { lower: true }),
      createdBy: req.user._id
    };

    // Add specifications if they exist
    if (req.body.specifications) {
      try {
        productData.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        // If specifications can't be parsed, continue without them
        console.log('No valid specifications provided');
      }
    }

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
      message: error.message
    });
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = Product.find()
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('specifications.specification');

    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    if (req.query.brand) {
      query = query.find({ brand: req.query.brand });
    }

    if (req.query.specifications) {
      try {
        const specFilters = JSON.parse(req.query.specifications);
        Object.entries(specFilters).forEach(([specId, value]) => {
          query = query.find({
            specifications: {
              $elemMatch: { specification: specId, value: value },
            },
          });
        });
      } catch (error) {
        console.error('Specification filter error:', error);
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter = {};
      if (req.query.minPrice) priceFilter.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.$lte = parseFloat(req.query.maxPrice);
      query = query.find({ price: priceFilter });
    }

    const sortOrder = req.query.sort === 'price-asc' ? 'price' : '-price';
    query = req.query.sort ? query.sort(sortOrder) : query.sort('-createdAt');

    const [products, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// GET PRODUCT BY ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand')
      .populate('category')
      .populate('createdBy', 'name')
      .populate('specifications.specification'); // Menambahkan ini

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    console.log("Update request body:", req.body);
    console.log("Files received:", req.files);

    // Create update object with basic fields
    const updates = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      costPrice: req.body.costPrice,
      stock: req.body.stock,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status || 'In Stock',
      lowStockThreshold: req.body.lowStockThreshold || 10
    };

    // Update slug if name changes
    if (req.body.name) {
      updates.slug = slugify(req.body.name, { lower: true });
    }

    // Handle images
    if (req.files && req.files.length > 0) {
      // Delete old images if new ones are uploaded
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '../public/images/products', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
      // Add new images
      updates.images = req.files.map(file => file.filename);
      updates.mainImage = updates.images[0];
    } else if (req.body.currentImages) {
      // Keep existing images if no new ones uploaded
      try {
        const currentImages = JSON.parse(req.body.currentImages);
        updates.images = currentImages;
        updates.mainImage = currentImages[0];
      } catch (e) {
        console.error('Error parsing currentImages:', e);
        // Keep existing images if parsing fails
        updates.images = product.images;
        updates.mainImage = product.mainImage;
      }
    }

    // Handle specifications
    if (req.body.specifications) {
      try {
        updates.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        console.error('Error parsing specifications:', e);
        // Keep existing specifications if parsing fails
        updates.specifications = product.specifications;
      }
    }

    console.log("Updates to be applied:", updates);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate(['brand', 'category', 'specifications.specification']);

    res.status(200).json({
      status: 'success',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
      details: error.errors || {}
    });
  }
};
// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '../public', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await Promise.all([
      Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: -1 } }),
      Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } }),
    ]);

    await product.remove();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

