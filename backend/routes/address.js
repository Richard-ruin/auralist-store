const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all address routes

// Add this new route for default address
router.get('/default', addressController.getDefaultAddress);

router
  .route('/')
  .get(addressController.getAllAddresses)
  .post(addressController.createAddress);

router
  .route('/:id')
  .get(addressController.getAddress)
  .patch(addressController.updateAddress)
  .delete(addressController.deleteAddress);

router
  .patch('/:id/set-default', addressController.setDefaultAddress);

module.exports = router;