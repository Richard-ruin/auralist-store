// services/chatService.js
import api from './api';

const chatService = {
  getAdminRooms: async () => {
    try {
      const response = await api.get('/chat/rooms', {
        params: { 
          type: 'admin' 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin rooms:', error);
      throw error;
    }
  },

  getRoomMessages: async (roomId) => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room messages:', error);
      throw error;
    }
  },
  createOrGetAdminRoom: async (userId) => {
    try {
      const response = await api.post('/chat/admin/rooms', { userId });
      return response.data;
    } catch (error) {
      console.error('Error creating/getting admin room:', error);
      throw error;
    }
  },

  sendMessage: async (roomId, content) => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content,
        messageType: 'admin'
      });
      return response.data;
    } catch (error) {
      // If room not found, try to create it
      if (error.response?.status === 404) {
        const roomResponse = await chatService.createOrGetAdminRoom(roomId);
        if (roomResponse.data.room) {
          // Retry sending message with new room
          return await api.post(`/chat/rooms/${roomResponse.data.room._id}/messages`, {
            content,
            messageType: 'admin'
          });
        }
      }
      console.error('Error sending message:', error);
      throw error;
    }
  },

  sendMessage: async (roomId, content) => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    if (!content) {
      throw new Error('Message content is required');
    }
    
    console.log('Sending message:', { roomId, content }); // Debug log
    
    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content,
        messageType: 'admin'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  

  updateRoomStatus: async (roomId, isActive) => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    try {
      const response = await api.patch(`/chat/rooms/${roomId}`, {
        isActive
      });
      return response.data;
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  },

  markMessagesAsRead: async (roomId) => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    try {
      const response = await api.post(`/chat/rooms/${roomId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
};

export default chatService;