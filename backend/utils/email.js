// utils/email.js
const nodemailer = require('nodemailer');

// Konfigurasi transporter email
// Modifikasi konfigurasi transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT), // Pastikan port adalah number, bukan string
  secure: true, // Ubah menjadi true karena menggunakan port 465
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Tambahkan untuk debugging
  logger: true // Tambahkan untuk logging detail
});

// Template email class
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Auralist Store <${process.env.EMAIL_FROM}>`;
  }

  // Send the actual email
  async send(template, subject) {
    // Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: this.generateTemplate(template)
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }

  // Generate HTML template based on type
  generateTemplate(template) {
    switch (template) {
      case 'welcome':
        return `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to Auralist Store, ${this.firstName}!</h1>
            <p>We're excited to have you join our community.</p>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${this.url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Verify Email</a>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        `;

      case 'resetPassword':
        return `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1>Password Reset Request</h1>
            <p>Hello ${this.firstName},</p>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <a href="${this.url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 10 minutes.</p>
          </div>
        `;

      case 'orderConfirmation':
        return `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1>Order Confirmation</h1>
            <p>Hello ${this.firstName},</p>
            <p>Thank you for your order! Here's your order confirmation link:</p>
            <a href="${this.url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">View Order</a>
          </div>
        `;

      case 'paymentReceived':
        return `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1>Payment Received!</h1>
            <p>Hello ${this.firstName},</p>
            <p>We've received your payment and your order is now being processed.</p>
            <p>You can track your order here:</p>
            <a href="${this.url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Track Order</a>
          </div>
        `;

      default:
        return `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1>Hello ${this.firstName}</h1>
            <p>${template}</p>
            ${this.url ? `<a href="${this.url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Click Here</a>` : ''}
          </div>
        `;
    }
  }
}

// Utility functions for sending specific emails
const sendVerificationEmail = async (user) => {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${user.verificationToken}`;
    const email = new Email(user, verifyUrl);
    await email.send('welcome', 'Welcome to Auralist Store - Please Verify Your Email');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Error sending verification email');
  }
};

const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    console.log('Starting to send password reset email');
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log('Reset URL created:', resetUrl);

    // Gunakan class Email yang sudah ada
    const email = new Email(user, resetUrl);
    await email.send('resetPassword', 'Password Reset Request');
    
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Detailed error in sendPasswordResetEmail:', error);
    throw new Error('Error sending password reset email');
  }
};
const sendOrderConfirmation = async (user, order) => {
  try {
    const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
    const email = new Email(user, orderUrl);
    await email.send('orderConfirmation', `Order Confirmation #${order._id}`);
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    throw new Error('Error sending order confirmation');
  }
};

const sendPaymentConfirmation = async (user, order) => {
  try {
    const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
    const email = new Email(user, orderUrl);
    await email.send('paymentReceived', `Payment Received for Order #${order._id}`);
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    throw new Error('Error sending payment confirmation');
  }
};

// Simple send function for custom emails
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('Attempting to send email with configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USERNAME,
      from: process.env.EMAIL_FROM
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || `<div style="font-family: Arial, sans-serif; padding: 20px;">${text}</div>`
    };

    console.log('Sending email with options:', { to, subject });
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Detailed email error:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    const emailError = new Error('Failed to send email');
    emailError.name = 'EmailError';
    emailError.originalError = error;
    throw emailError;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendEmail
};