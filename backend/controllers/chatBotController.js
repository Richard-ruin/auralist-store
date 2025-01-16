const ChatBotResponse = require('../models/ChatBotResponse');
const ChatMessage = require('../models/ChatMessage');
const catchAsync = require('../utils/catchAsync');

// Helper function to find the best matching response
const findBestResponse = async (message) => {
  const words = message.toLowerCase().split(' ');
  
  // Find responses with matching keywords
  const responses = await ChatBotResponse.find({
    isActive: true,
    keywords: {
      $in: words
    }
  }).sort({ priority: -1 });

  if (responses.length > 0) {
    return responses[0].response;
  }

  // Default response if no match is found
  return "I apologize, but I don't understand your question. Please contact our customer service for further assistance.";
};

// Generate automated response
exports.generateResponse = catchAsync(async (req, res) => {
  const { message, roomId } = req.body;

  // Get appropriate response
  const botResponse = await findBestResponse(message);

  // Save bot response as new message
  const chatMessage = await ChatMessage.create({
    sender: null, // null indicates bot message
    roomId,
    content: botResponse,
    messageType: 'bot',
    readBy: [{ user: req.user._id }]
  });

  // Emit socket event for real-time update
  req.app.get('io').to(`room:${roomId}`).emit('newMessage', chatMessage);

  res.status(200).json({
    status: 'success',
    data: {
      message: chatMessage
    }
  });
});

// CRUD operations for bot responses (admin only)
exports.createBotResponse = catchAsync(async (req, res) => {
  const { keywords, response, category, priority } = req.body;

  const botResponse = await ChatBotResponse.create({
    keywords,
    response,
    category,
    priority: priority || 0
  });

  res.status(201).json({
    status: 'success',
    data: {
      botResponse
    }
  });
});

exports.getBotResponses = catchAsync(async (req, res) => {
  const responses = await ChatBotResponse.find()
    .sort({ category: 1, priority: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      responses
    }
  });
});

exports.updateBotResponse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { keywords, response, category, priority, isActive } = req.body;

  const botResponse = await ChatBotResponse.findByIdAndUpdate(
    id,
    {
      keywords,
      response,
      category,
      priority,
      isActive
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      botResponse
    }
  });
});

exports.deleteBotResponse = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ChatBotResponse.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Initialize default responses
exports.initializeDefaultResponses = catchAsync(async () => {
  const defaultResponses = [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      response: 'Hello! Welcome to Auralist. How can I assist you today?',
      category: 'general',
      priority: 1
    },
    {
      keywords: ['pay', 'payment', 'purchase'],
      response: 'We accept payments via bank transfer, credit cards, and e-wallets. For more information, please visit our payment page.',
      category: 'payment',
      priority: 1
    },
    {
      keywords: ['ship', 'shipping', 'delivery', 'track'],
      response: 'Shipping takes 1-3 business days. You can track your order through our order tracking page.',
      category: 'shipping',
      priority: 1
    },
    {
      keywords: ['product', 'item', 'stock', 'available'],
      response: 'We offer a wide range of high-quality audio products. Please visit our products page to view our complete collection.',
      category: 'product',
      priority: 1
    },
    {
      keywords: ['return', 'refund', 'exchange'],
      response: 'Our return policy allows returns within 14 days of delivery. Please ensure the product is in its original condition.',
      category: 'returns',
      priority: 1
    },
    {
      keywords: ['contact', 'support', 'help', 'service'],
      response: 'Our customer service team is available 24/7. You can email us at support@auralist.com or use the live chat feature.',
      category: 'support',
      priority: 1
    },
    {
      keywords: ['warranty', 'guarantee'],
      response: 'All our products come with a 1-year manufacturer warranty. For warranty claims, please contact our support team.',
      category: 'warranty',
      priority: 1
    },
    {
      keywords: ['price', 'cost', 'discount', 'sale'],
      response: 'Our prices are competitive and we regularly offer discounts. Check our special offers page for current promotions.',
      category: 'pricing',
      priority: 1
    }
  ];

  for (const response of defaultResponses) {
    await ChatBotResponse.findOneAndUpdate(
      { keywords: response.keywords },
      response,
      { upsert: true }
    );
  }
});