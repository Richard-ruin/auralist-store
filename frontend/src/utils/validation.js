const Joi = require('joi');

// User validation schemas
exports.registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number',
      'any.required': 'Password is required'
    }),
    
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

exports.loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

exports.resetPasswordSchema = Joi.object({
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number',
      'any.required': 'Password is required'
    }),
    
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match'
    })
});

// Product validation schemas
exports.productSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required(),
    
  description: Joi.string()
    .min(10)
    .required(),
    
  price: Joi.number()
    .min(0)
    .required(),
    
  category: Joi.string()
    .required(),
    
  brand: Joi.string()
    .required(),
    
  stock: Joi.number()
    .min(0)
    .required()
});

// Order validation schemas
exports.orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().min(1).required()
      })
    )
    .min(1)
    .required(),
    
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  
  paymentMethod: Joi.string()
    .valid('credit_card', 'paypal', 'bank_transfer')
    .required()
});

// utils/validation.js
export const validateOrderData = (orderData) => {
  const errors = [];

  // Check items array
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Order must have at least one item');
  }

  // Validate each item
  orderData.items?.forEach((item, index) => {
    if (!item.product) {
      errors.push(`Item ${index + 1}: Product ID is required`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
    }
    if (typeof item.price !== 'number' || item.price <= 0) {
      errors.push(`Item ${index + 1}: Price must be a positive number`);
    }
  });

  // Validate shipping address
  if (!orderData.shippingAddress) {
    errors.push('Shipping address is required');
  } else {
    const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
    requiredFields.forEach(field => {
      if (!orderData.shippingAddress[field]) {
        errors.push(`Shipping address ${field} is required`);
      }
    });
  }

  // Validate total amount
  if (typeof orderData.totalAmount !== 'number' || orderData.totalAmount <= 0) {
    errors.push('Total amount must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};