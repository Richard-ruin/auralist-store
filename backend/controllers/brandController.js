const Brand = require('../models/Brand');
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');

exports.createBrand = async (req, res) => {
  try {
    const { name, description, status, website } = req.body;
    const logo = req.file ? req.file.filename : '';
    
    const brand = await Brand.create({
      name,
      description,
      status,
      website,
      logo,
      slug: slugify(name, { lower: true })
    });
    
    res.status(201).json({ status: 'success', data: brand });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json({ status: 'success', data: brands });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name, description, status, website, currentLogo } = req.body;
    const updates = {
      name,
      description,
      status,
      website,
      slug: name ? slugify(name, { lower: true }) : undefined
    };
    
    if (req.file) {
      updates.logo = req.file.filename;
      
      if (currentLogo) {
        const oldLogoPath = path.join(__dirname, '../public/images/brands', currentLogo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    } else if (currentLogo) {
      updates.logo = currentLogo;
    }
    
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Brand not found' 
      });
    }

    res.json({ 
      status: 'success', 
      data: brand 
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(400).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        status: 'error',
        message: 'Brand not found'
      });
    }

    // Delete logo file if it exists
    if (brand.logo) {
      const logoPath = path.join(__dirname, '../public/images/brands', brand.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await Brand.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};