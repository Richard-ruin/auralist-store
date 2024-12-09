// utils/formatters.js
export const formatters = {
    // Currency formatter
    currency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      },
    // Date formatter
    date: (date, format = 'full') => {
      const options = {
        full: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        },
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        },
        time: {
          hour: '2-digit',
          minute: '2-digit'
        }
      };
  
      return new Intl.DateTimeFormat('id-ID', options[format]).format(new Date(date));
    },
  
    // Phone number formatter
    phoneNumber: (number) => {
      if (!number) return '';
      const cleaned = number.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
      if (match) {
        return `+${match[1]}-${match[2]}-${match[3]}`;
      }
      return number;
    }
  };
  
  // utils/validators.js
  export const validators = {
    required: (value) => {
      return value ? undefined : 'Bidang ini wajib diisi';
    },
  
    email: (value) => {
      if (!value) return;
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return emailRegex.test(value) ? undefined : 'Format email tidak valid';
    },
  
    password: (value) => {
      if (!value) return;
      const hasMinLength = value.length >= 8;
      const hasNumber = /\d/.test(value);
      const hasLetter = /[a-zA-Z]/.test(value);
      
      if (!hasMinLength) return 'Password minimal 8 karakter';
      if (!hasNumber || !hasLetter) return 'Password harus mengandung huruf dan angka';
      return undefined;
    },
  
    phoneNumber: (value) => {
      if (!value) return;
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
      return phoneRegex.test(value) ? undefined : 'Nomor telepon tidak valid';
    },
  
    creditCard: (value) => {
      if (!value) return;
      // Test card numbers support
      const testCards = [
        '4242424242424242', // Visa
        '5555555555554444', // Mastercard
        '378282246310005',  // American Express
        '6011111111111117'  // Discover
      ];
      
      const cleaned = value.replace(/\s/g, '');
      return testCards.includes(cleaned) ? undefined : 'Nomor kartu kredit tidak valid (gunakan nomor test)';
    }
  };
  
  // utils/storage.js
  export const storage = {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
  
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    },
  
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    },
  
    clear: () => {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };
  
  // utils/helpers.js
  export const helpers = {
    // Error handler for async functions
    asyncHandler: (fn) => {
      return async (...args) => {
        try {
          return await fn(...args);
        } catch (error) {
          throw error.response?.data || error.message || 'An error occurred';
        }
      };
    },
  
    // Debounce function
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
  
    // Deep clone object
    deepClone: (obj) => {
      return JSON.parse(JSON.stringify(obj));
    },
  
    // Generate random string
    generateId: (length = 8) => {
      return Math.random().toString(36).substring(2, length + 2);
    },
  
    // Format file size
    formatFileSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  };
  
  // utils/constants.js
  export const constants = {
    ORDER_STATUS: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    },
  
    PAYMENT_STATUS: {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      REFUNDED: 'refunded'
    },
  
    PAYMENT_METHODS: {
      CREDIT_CARD: 'credit_card',
      BANK_TRANSFER: 'bank_transfer'
    },
  
    USER_ROLES: {
      ADMIN: 'admin',
      CUSTOMER: 'customer'
    },
  
    API_ENDPOINTS: {
      AUTH: '/auth',
      USERS: '/users',
      PRODUCTS: '/products',
      ORDERS: '/orders',
      PAYMENTS: '/payments'
    }
  };

  