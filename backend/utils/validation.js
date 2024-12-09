// utils/validation.js
const Joi = require('joi');

// Auth Validation Schemas
const authValidation = {
  register: Joi.object({
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
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }),

  login: Joi.object({
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
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  resetPassword: Joi.object({
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
    
    passwordConfirm: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  })
};

// Order Validation Schemas
const orderValidation = {
  createOrder: Joi.object({
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().valid('bank_transfer', 'credit_card').required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('processing', 'shipped', 'delivered', 'cancelled').required()
  })
};

// Payment Validation Schemas
const paymentValidation = {
  bankTransfer: Joi.object({
    bankName: Joi.string().required(),
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    transferDate: Joi.date().required(),
    amount: Joi.number().positive().required()
  }),

  creditCard: Joi.object({
    cardNumber: Joi.string().required(),
    cardType: Joi.string().valid('visa', 'mastercard', 'amex', 'discover').required(),
    expiryMonth: Joi.number().integer().min(1).max(12).required(),
    expiryYear: Joi.number().integer().min(new Date().getFullYear()).required(),
    cvv: Joi.string().length(3).required()
  })
};

module.exports = {
  authValidation,
  orderValidation,
  paymentValidation
};