// utils/paymentUtils.js
import { CARD_TYPES, FILE_UPLOAD_CONFIG } from '../constants/payment';

// Validate credit card number using Luhn algorithm
export const validateCardNumber = (number) => {
  const digits = number.replace(/\D/g, '');
  
  if (digits.length !== 16) return false;
  
  let sum = 0;
  let isEven = false;
  
  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Validate card expiry date
export const validateCardExpiry = (month, year) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  year = parseInt(year);
  month = parseInt(month);

  if (!month || !year || month < 1 || month > 12) return false;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

// Validate CVV
export const validateCVV = (cvv, cardType) => {
  const cvvLength = cvv.toString().length;
  return cardType === CARD_TYPES.AMEX ? cvvLength === 4 : cvvLength === 3;
};

// Format card number with spaces
export const formatCardNumber = (number) => {
  const digits = number.replace(/\D/g, '');
  const groups = digits.match(/\d{1,4}/g) || [];
  return groups.join(' ');
};

// Get card type from number
export const getCardType = (number) => {
  const patterns = {
    [CARD_TYPES.VISA]: /^4/,
    [CARD_TYPES.MASTERCARD]: /^5[1-5]/,
    [CARD_TYPES.AMEX]: /^3[47]/,
    [CARD_TYPES.DISCOVER]: /^6(?:011|5)/
  };

  const cleanNumber = number.replace(/\D/g, '');
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) return type;
  }

  return null;
};

// Validate file upload
export const validateFileUpload = (file) => {
  if (!file) return { isValid: false, error: 'No file selected' };

  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    return {
      isValid: false,
      error: `File size should not exceed ${FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024)}MB`
    };
  }

  if (!FILE_UPLOAD_CONFIG.acceptedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file format. Please upload an image or PDF file'
    };
  }

  return { isValid: true, error: null };
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format payment status for display
export const formatPaymentStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Create payment description
export const createPaymentDescription = (order) => {
  const items = order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ');
  return `Payment for order #${order._id} (${items})`;
};

// Calculate payment amounts
export const calculatePaymentAmounts = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total
  };
};