// controllers/specificationController.js
const Specification = require('../models/Specification');
const Category = require('../models/Category');

exports.createSpecification = async (req, res) => {
  try {
    console.log('Creating specification:', req.body);

    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }

    // Validate type and options
    if (req.body.type === 'select' && (!req.body.options || req.body.options.length === 0)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Select type specification must have options'
      });
    }

    // Create specification with cleaned data
    const specificationData = {
      category: req.body.category,
      name: req.body.name.trim(),
      displayName: req.body.displayName.trim(),
      type: req.body.type,
      isRequired: req.body.isRequired || false,
      order: req.body.order || 0
    };

    // Add optional fields if present
    if (req.body.unit) {
      specificationData.unit = req.body.unit.trim();
    }

    if (req.body.options && req.body.type === 'select') {
      specificationData.options = Array.isArray(req.body.options) 
        ? req.body.options 
        : req.body.options.split(',').map(opt => opt.trim());
    }

    const specification = await Specification.create(specificationData);

    res.status(201).json({
      status: 'success',
      data: specification
    });
  } catch (error) {
    console.error('Specification creation error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
      details: error.errors || {}
    });
  }
};

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
      status: 'fail',
      message: error.message
    });
  }
};

exports.getSpecificationsByCategory = async (req, res) => {
  try {
    const specifications = await Specification.find({ 
      category: req.params.categoryId,
      status: 'Active'
    }).sort('order');
    
    res.status(200).json({
      status: 'success',
      data: specifications
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateSpecification = async (req, res) => {
  try {
    // Validate type and options if type is being changed to 'select'
    if (req.body.type === 'select' && (!req.body.options || req.body.options.length === 0)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Select type specification must have options'
      });
    }

    const updates = {
      ...req.body,
      // Clean string inputs
      ...(req.body.name && { name: req.body.name.trim() }),
      ...(req.body.displayName && { displayName: req.body.displayName.trim() }),
      ...(req.body.unit && { unit: req.body.unit.trim() })
    };

    // Handle options specially for select type
    if (req.body.options && req.body.type === 'select') {
      updates.options = Array.isArray(req.body.options)
        ? req.body.options
        : req.body.options.split(',').map(opt => opt.trim());
    }

    const specification = await Specification.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!specification) {
      return res.status(404).json({
        status: 'fail',
        message: 'Specification not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: specification
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteSpecification = async (req, res) => {
  try {
    const specification = await Specification.findById(req.params.id);
    
    if (!specification) {
      return res.status(404).json({
        status: 'fail',
        message: 'Specification not found'
      });
    }

    // Soft delete - just change status to inactive
    specification.status = 'Inactive';
    await specification.save();

    res.status(200).json({
      status: 'success',
      message: 'Specification deactivated successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.reorderSpecifications = async (req, res) => {
  try {
    const { specifications } = req.body;
    
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
      status: 'fail',
      message: error.message
    });
  }
};