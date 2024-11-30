// controllers/specificationController.js
const { Specification } = require('../models/Specification');
const Category = require('../models/Category');

// Get all specifications
exports.getAllSpecifications = async (req, res) => {
  try {
    const specifications = await Specification.find()
      .populate('category', 'name')
      .sort('category order');
      
    res.status(200).json({
      status: 'success',
      data: specifications
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get specifications by category
exports.getSpecificationsByCategory = async (req, res) => {
  try {
    const specifications = await Specification.findByCategory(req.params.categoryId)
      .populate('category', 'name');
    
    res.status(200).json({
      status: 'success',
      data: specifications
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new specification
exports.createSpecification = async (req, res) => {
  try {
    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Create specification
    const specification = await Specification.create(req.body);

    res.status(201).json({
      status: 'success',
      data: specification
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update specification
exports.updateSpecification = async (req, res) => {
  try {
    // If category is being updated, validate it exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
    }

    const specification = await Specification.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!specification) {
      return res.status(404).json({
        status: 'error',
        message: 'Specification not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: specification
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete specification
exports.deleteSpecification = async (req, res) => {
  try {
    const specification = await Specification.findById(req.params.id);
    
    if (!specification) {
      return res.status(404).json({
        status: 'error',
        message: 'Specification not found'
      });
    }

    // Instead of deleting, set status to inactive
    specification.status = 'Inactive';
    await specification.save();

    res.status(200).json({
      status: 'success',
      message: 'Specification has been deactivated'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Bulk create specifications
exports.bulkCreateSpecifications = async (req, res) => {
  try {
    const { categoryId, specifications } = req.body;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Add category to each specification
    const specsWithCategory = specifications.map(spec => ({
      ...spec,
      category: categoryId
    }));

    // Create all specifications
    const createdSpecs = await Specification.insertMany(specsWithCategory);

    res.status(201).json({
      status: 'success',
      data: createdSpecs
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reorder specifications
exports.reorderSpecifications = async (req, res) => {
  try {
    const { specifications } = req.body;
    
    // Update order of each specification
    await Promise.all(
      specifications.map(({ id, order }) => 
        Specification.findByIdAndUpdate(id, { order })
      )
    );

    res.status(200).json({
      status: 'success',
      message: 'Specifications reordered successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};