const Category = require('../models/Category');
const slugify = require('slugify');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    // Simpan hanya nama file saja
    const image = req.file ? req.file.filename : '';
    
    const category = await Category.create({
      name,
      description,
      status,
      image,
      slug: slugify(name, { lower: true })
    });
    
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// controllers/categoryController.js
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status, currentImage } = req.body;
    const updates = {
      name,
      description,
      status,
      slug: name ? slugify(name, { lower: true }) : undefined
    };
    
    // If there's a new image uploaded
    if (req.file) {
      updates.image = req.file.filename;
      
      // Delete old image if exists
      if (currentImage) {
        const oldImagePath = path.join(__dirname, '../public/images/categories', currentImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (currentImage) {
      // Keep the current image if no new image is uploaded
      updates.image = currentImage;
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Category not found' 
      });
    }

    res.json({ 
      status: 'success', 
      data: category 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};