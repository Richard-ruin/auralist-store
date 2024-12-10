// utils/errorHandler.js
export class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
  }
  
  export const handleError = (error) => {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  
    // Network or server errors
    if (!error.response) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 500
      };
    }
  
    // API errors with response
    const statusCode = error.response.status;
    const errorData = error.response.data;
  
    switch (statusCode) {
      case 400:
        return {
          message: errorData?.message || 'Invalid request data. Please check your input.',
          statusCode,
          details: errorData?.details
        };
      case 401:
        return {
          message: 'Please login to continue.',
          statusCode
        };
      case 403:
        return {
          message: 'You are not authorized to perform this action.',
          statusCode
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          statusCode
        };
      default:
        return {
          message: errorData?.message || 'An unexpected error occurred.',
          statusCode
        };
    }
  };