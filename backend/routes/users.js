// backend/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect); // Protect all routes after this middleware
router.use(restrictTo('admin')); // Only admin can access these routes

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/stats')
  .get(userController.getUserStats);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;