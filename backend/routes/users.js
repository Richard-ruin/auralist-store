// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const uploadProfile = require('../middleware/uploadProfile');
const { protect, restrictTo } = require('../middleware/auth');

// Protect all routes after this middleware
router.use(protect);

// Avatar routes
router.post(
  '/:id/avatar',
  uploadProfile.single('avatar'), // Specify the field name
  userController.updateAvatar  // Make sure this is a function, not an object
);

router.post(
  '/:id/avatar/reset',
  userController.resetToGeneratedAvatar
);

// Admin routes
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.get('/stats', restrictTo('admin'), userController.getUserStats);
router.patch('/:id/status', protect, restrictTo('admin'), userController.updateUserStatus);
router.get('/:id/status-history', protect, restrictTo('admin'), userController.getUserStatusHistory);
router.route('/:id')
  .get(restrictTo('admin'), userController.getUser)
  .patch(restrictTo('admin'), userController.updateUser)
  .delete(restrictTo('admin'), userController.deleteUser);

module.exports = router;