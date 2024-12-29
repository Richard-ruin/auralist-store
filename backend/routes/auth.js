const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updatePassword,
  updateMe,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', (req, res, next) => {
  console.log('Forgot password request received:', {
    email: req.body.email,
    timestamp: new Date().toISOString()
  });
  forgotPassword(req, res, next);
});
router.patch('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes (require authentication)
router.use(protect);
router.patch('/update-password', updatePassword);
router.patch('/update-me', updateMe);
router.post('/logout', logout);

module.exports = router;