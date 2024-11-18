const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendEmail = async options => {
  try {
    // Create email options
    const mailOptions = {
      from: `Auralist Store <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Send email
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Error sending email');
  }
};