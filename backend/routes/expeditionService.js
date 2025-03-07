// routes/expeditionService.js
const express = require('express');
const router = express.Router();
const expeditionServiceController = require('../controllers/expeditionServiceController');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/expeditions');
  },
  filename: function (req, file, cb) {
    cb(null, `expedition-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/', expeditionServiceController.getAllServices);
router.get('/:id', expeditionServiceController.getServiceById);
router.get('/type/:type', expeditionServiceController.getServicesByType);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', 
  upload.single('logo'),
  expeditionServiceController.createService
);

router.patch('/:id',
  upload.single('logo'),
  expeditionServiceController.updateService
);

router.delete('/:id', expeditionServiceController.deleteService);

module.exports = router;