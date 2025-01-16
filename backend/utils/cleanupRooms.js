// utils/cleanupRooms.js
const ChatRoom = require('../models/ChatRoom');

const cleanupInactiveRooms = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await ChatRoom.deleteMany({
    isActive: false,
    updatedAt: { $lt: thirtyDaysAgo }
  });
};

module.exports = cleanupInactiveRooms;