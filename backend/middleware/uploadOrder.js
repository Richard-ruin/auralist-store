// middleware/uploadOrder.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Membuat direktori jika belum ada
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Konfigurasi storage untuk receipt pembayaran
const receiptStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'uploads/orders/receipts';
    createDir(dir);
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const orderId = req.params.orderId || 'temp';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `receipt-${orderId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter untuk receipt
const receiptFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only image files (jpg, jpeg, png)'), false);
  }
};

// Konfigurasi multer untuk receipt
const uploadReceipt = multer({
  storage: receiptStorage,
  fileFilter: receiptFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Max 1 file
  }
});

// Error handler untuk multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  } else if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  next();
};

// Utility function untuk menghapus file
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting file:', err);
  });
};

module.exports = {
  uploadReceipt,
  handleUploadError,
  deleteFile
};