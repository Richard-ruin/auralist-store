// constants/payment.js
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  };
  
  export const PAYMENT_METHODS = {
    BANK_TRANSFER: 'bank_transfer',
    CREDIT_CARD: 'credit_card'
  };
  
  export const PAYMENT_ERROR_CODES = {
    INVALID_CARD: 'INVALID_CARD',
    EXPIRED_CARD: 'EXPIRED_CARD',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    SYSTEM_ERROR: 'SYSTEM_ERROR'
  };
  
  export const BANK_NAMES = {
    BCA: 'Bank Central Asia',
    BNI: 'Bank Negara Indonesia',
    BRI: 'Bank Rakyat Indonesia',
    MANDIRI: 'Bank Mandiri'
  };
  
  export const CARD_TYPES = {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    AMEX: 'amex',
    DISCOVER: 'discover'
  };
  
  export const PAYMENT_MESSAGES = {
    success: {
      bankTransfer: 'Bank transfer initiated successfully. Please complete the payment.',
      creditCard: 'Credit card payment processed successfully.',
      proofSubmitted: 'Transfer proof submitted successfully.',
      paymentVerified: 'Payment verified successfully.'
    },
    error: {
      invalidCard: 'Invalid card details. Please check and try again.',
      expiredCard: 'Card has expired. Please use a valid card.',
      insufficientFunds: 'Insufficient funds. Please use a different card.',
      invalidAmount: 'Invalid payment amount.',
      systemError: 'System error occurred. Please try again later.',
      proofRequired: 'Please upload payment proof.',
      invalidProof: 'Invalid payment proof. Please upload a valid image.'
    }
  };
  
  export const FILE_UPLOAD_CONFIG = {
    maxSize: 2 * 1024 * 1024, // 2MB
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFiles: 1
  };