
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
  