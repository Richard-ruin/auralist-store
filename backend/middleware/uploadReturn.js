// middleware/uploadReturn.js
const multer = require('multer');
const fs = require('fs');
const AppError = require('../utils/appError');

// Pastikan direktori upload ada
const createUploadDirectories = () => {
  const dirs = [
    'public/uploads/returns/images',
    'public/uploads/returns/videos'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = file.fieldname === 'unboxingVideo' 
      ? 'public/uploads/returns/videos'
      : 'public/uploads/returns/images';
    cb(null, path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `return-${req.params.orderId}-${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'unboxingVideo') {
    if (!file.mimetype.startsWith('video/')) {
      cb(new AppError('Please upload a valid video file', 400), false);
      return;
    }
  } else if (file.fieldname === 'images') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new AppError('Please upload valid image files', 400), false);
      return;
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5 // Max 5 files total
  }
});

const uploadReturnFiles = upload.fields([
  { name: 'images', maxCount: 4 },
  { name: 'unboxingVideo', maxCount: 1 }
]);

module.exports = uploadReturnFiles;