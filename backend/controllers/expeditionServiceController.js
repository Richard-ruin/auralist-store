// controllers/expeditionServiceController.js
const { ExpeditionService } = require('../models/ExpeditionService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all expedition services
exports.getAllServices = catchAsync(async (req, res) => {
  const services = await ExpeditionService.find({ isActive: true });
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: services
  });
});

// Get expedition service by ID
exports.getServiceById = catchAsync(async (req, res, next) => {
  const service = await ExpeditionService.findById(req.params.id);
  
  if (!service) {
    return next(new AppError('No expedition service found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: service
  });
});

// Create new expedition service (admin only)
exports.createService = catchAsync(async (req, res, next) => {
  const { name, code, type, description, website, estimatedDeliveryTime } = req.body;
  
  if (!name || !code || !type) {
    return next(new AppError('Please provide name, code and type', 400));
  }
  
  // Check if service with same code already exists
  const existingService = await ExpeditionService.findOne({ code: code.toUpperCase() });
  
  if (existingService) {
    return next(new AppError('An expedition service with this code already exists', 400));
  }
  
  const newService = await ExpeditionService.create({
    name,
    code: code.toUpperCase(),
    logo: req.file ? req.file.filename : undefined,
    type,
    description,
    website,
    estimatedDeliveryTime,
    isActive: true
  });
  
  res.status(201).json({
    status: 'success',
    data: newService
  });
});

// Update expedition service (admin only)
exports.updateService = catchAsync(async (req, res, next) => {
  const { name, description, website, estimatedDeliveryTime, isActive } = req.body;
  
  const updateData = {};
  
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (website) updateData.website = website;
  if (estimatedDeliveryTime) updateData.estimatedDeliveryTime = estimatedDeliveryTime;
  if (isActive !== undefined) updateData.isActive = isActive;
  
  if (req.file) {
    updateData.logo = req.file.filename;
  }
  
  const service = await ExpeditionService.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!service) {
    return next(new AppError('No expedition service found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: service
  });
});

// Delete expedition service (admin only)
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await ExpeditionService.findByIdAndDelete(req.params.id);
  
  if (!service) {
    return next(new AppError('No expedition service found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get services by type (domestic or international)
exports.getServicesByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  if (!['domestic', 'international'].includes(type)) {
    return next(new AppError('Invalid type. Must be either domestic or international', 400));
  }
  
  const services = await ExpeditionService.find({ type, isActive: true });
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: services
  });
});