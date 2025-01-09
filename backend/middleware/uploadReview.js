const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/reviews');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max-limit
    files: 3 // Maximum 3 files
  },
  fileFilter: fileFilter
});

// Middleware for handling multiple image uploads
const uploadReviewImages = upload.array('images', 3);

// Wrapper function to handle multer errors
const handleReviewUpload = (req, res, next) => {
  uploadReviewImages(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'File too large. Maximum size is 5MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum 3 images allowed'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }

    // Everything went fine
    next();
  });
};

module.exports = handleReviewUpload;