// utils/fileUpload.js
const path = require('path');
const fs = require('fs').promises;

exports.uploadToStorage = async (file) => {
  try {
    const uploadDir = 'public/uploads/payments';
    
    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `payment-${uniqueSuffix}${path.extname(file.originalname)}`;
    
    await fs.writeFile(path.join(uploadDir, filename), file.buffer);
    
    return `uploads/payments/${filename}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Error uploading file');
  }
};

// utils/paymentHelpers.js
exports.validateCreditCard = (cardNumber) => {
  const testCards = {
    'visa': '4242424242424242',
    'mastercard': '5555555555554444',
    'amex': '378282246310005',
    'discover': '6011111111111117'
  };

  return Object.values(testCards).includes(cardNumber.replace(/\s/g, ''));
};

exports.getCardType = (cardNumber) => {
  // Remove any spaces or hyphens
  cardNumber = cardNumber.replace(/[\s-]/g, '');
  
  if (/^4/.test(cardNumber)) return 'visa';
  if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
  if (/^3[47]/.test(cardNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cardNumber)) return 'discover';
  return 'unknown';
};

exports.validateExpiryDate = (month, year) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  // Convert to numbers
  month = parseInt(month, 10);
  year = parseInt(year, 10);

  // Basic validation
  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

// utils/appError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;