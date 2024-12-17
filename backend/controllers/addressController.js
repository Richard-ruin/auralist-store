const Address = require('../models/Address');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllAddresses = catchAsync(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  
  res.status(200).json({
    status: 'success',
    results: addresses.length,
    data: addresses
  });
});

exports.getAddress = catchAsync(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: address
  });
});

exports.createAddress = catchAsync(async (req, res) => {
  // Add user ID to address data
  const addressData = {
    ...req.body,
    user: req.user._id
  };

  // If this is user's first address, make it default
  const addressCount = await Address.countDocuments({ user: req.user._id });
  if (addressCount === 0) {
    addressData.isDefault = true;
  }

  const address = await Address.create(addressData);

  res.status(201).json({
    status: 'success',
    data: address
  });
});

exports.updateAddress = catchAsync(async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: address
  });
});

exports.deleteAddress = catchAsync(async (req, res) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // If deleted address was default, make oldest remaining address default
  if (address.isDefault) {
    const oldestAddress = await Address.findOne({ user: req.user._id })
      .sort({ createdAt: 1 });
    
    if (oldestAddress) {
      oldestAddress.isDefault = true;
      await oldestAddress.save();
    }
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add this to your existing addressController.js
exports.getDefaultAddress = catchAsync(async (req, res) => {
  const defaultAddress = await Address.findOne({
    user: req.user._id,
    isDefault: true
  });

  if (!defaultAddress) {
    throw new AppError('No default address found. Please add an address first.', 404);
  }

  res.status(200).json({
    status: 'success',
    data: defaultAddress
  });
});

exports.setDefaultAddress = catchAsync(async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isDefault: true },
    { new: true }
  );

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: address
  });
});