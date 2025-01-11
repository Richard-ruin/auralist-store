const multer = require('multer');
const AppError = require('../utils/appError');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/chat');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `chat-${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images, documents, and common file types
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('application/pdf') ||
      file.mimetype.includes('spreadsheet') ||
      file.mimetype.includes('document')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an allowed file type', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;