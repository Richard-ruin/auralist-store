const ChatBotResponse = require('../models/ChatBotResponse');
const ChatMessage = require('../models/ChatMessage');
const catchAsync = require('../utils/catchAsync');

// Helper function untuk mencari respons yang paling sesuai
const findBestResponse = async (message) => {
  const words = message.toLowerCase().split(' ');
  
  // Cari respons yang keyword-nya cocok dengan pesan
  const responses = await ChatBotResponse.find({
    isActive: true,
    keywords: {
      $in: words
    }
  }).sort({ priority: -1 });

  if (responses.length > 0) {
    return responses[0].response;
  }

  // Default response jika tidak ada yang cocok
  return "Maaf, saya tidak mengerti pertanyaan Anda. Silakan hubungi customer service kami untuk bantuan lebih lanjut.";
};

// Generate respons otomatis
exports.generateResponse = catchAsync(async (req, res) => {
  const { message, roomId } = req.body;

  // Dapatkan respons yang sesuai
  const botResponse = await findBestResponse(message);

  // Simpan respons bot sebagai pesan baru
  const chatMessage = await ChatMessage.create({
    sender: null, // null untuk menandakan ini pesan dari bot
    roomId,
    content: botResponse,
    messageType: 'bot',
    readBy: [{ user: req.user._id }]
  });

  // Emit socket event untuk real-time update
  req.app.get('io').to(`room:${roomId}`).emit('newMessage', chatMessage);

  res.status(200).json({
    status: 'success',
    data: {
      message: chatMessage
    }
  });
});

// CRUD untuk respons bot (admin only)
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

// Inisialisasi respons default
exports.initializeDefaultResponses = catchAsync(async () => {
  const defaultResponses = [
    {
      keywords: ['halo', 'hi', 'hey'],
      response: 'Halo! Selamat datang di Auralist. Ada yang bisa saya bantu?',
      category: 'general',
      priority: 1
    },
    {
      keywords: ['bayar', 'pembayaran', 'payment'],
      response: 'Kami menerima pembayaran melalui transfer bank, kartu kredit, dan e-wallet. Untuk informasi lebih lanjut, silakan kunjungi halaman pembayaran kami.',
      category: 'payment',
      priority: 1
    },
    {
      keywords: ['kirim', 'pengiriman', 'shipping'],
      response: 'Pengiriman dilakukan dalam 1-3 hari kerja. Anda dapat melacak pesanan Anda melalui halaman pesanan.',
      category: 'shipping',
      priority: 1
    },
    {
      keywords: ['produk', 'barang'],
      response: 'Kami menyediakan berbagai produk audio berkualitas tinggi. Silakan kunjungi halaman produk kami untuk melihat koleksi lengkap.',
      category: 'product',
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