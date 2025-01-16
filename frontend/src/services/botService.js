// services/botService.js
import api from './api';

const botService = {
  // Generate bot response
  generateResponse: async (message, roomId) => {
    if (!message || !roomId) {
      throw new Error('Message and room ID are required');
    }

    try {
      const response = await api.post('/chatbot/response', {
        message,
        roomId
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from bot service');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error generating bot response:', error);
      // Return a fallback response if the bot service fails
      return {
        message: {
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          messageType: 'bot',
          roomId,
          createdAt: new Date(),
          _id: Date.now()
        }
      };
    }
  },

  // Admin functions for managing bot responses
  getBotResponses: async () => {
    try {
      const response = await api.get('/chatbot/responses');
      
      if (!response.data?.data?.responses) {
        throw new Error('Invalid response format for bot responses');
      }
      
      return response.data.data.responses;
    } catch (error) {
      console.error('Error fetching bot responses:', error);
      throw error;
    }
  },

  createBotResponse: async (botResponseData) => {
    if (!botResponseData?.keywords || !botResponseData?.response || !botResponseData?.category) {
      throw new Error('Keywords, response, and category are required');
    }

    try {
      const response = await api.post('/chatbot/responses', botResponseData);
      
      if (!response.data?.data?.botResponse) {
        throw new Error('Invalid response format when creating bot response');
      }
      
      return response.data.data.botResponse;
    } catch (error) {
      console.error('Error creating bot response:', error);
      throw error;
    }
  },

  updateBotResponse: async (id, updateData) => {
    if (!id) {
      throw new Error('Response ID is required');
    }

    try {
      const response = await api.patch(`/chatbot/responses/${id}`, updateData);
      
      if (!response.data?.data?.botResponse) {
        throw new Error('Invalid response format when updating bot response');
      }
      
      return response.data.data.botResponse;
    } catch (error) {
      console.error('Error updating bot response:', error);
      throw error;
    }
  },

  deleteBotResponse: async (id) => {
    if (!id) {
      throw new Error('Response ID is required');
    }

    try {
      const response = await api.delete(`/chatbot/responses/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting bot response:', error);
      throw error;
    }
  },

  // Initialize bot chat
  initializeBotChat: async () => {
    try {
      // First check if there's an existing bot room
      const existingRooms = await api.get('/chat/rooms', {
        params: { type: 'bot' }
      });

      if (existingRooms.data?.data?.rooms?.length > 0) {
        return existingRooms.data.data.rooms[0];
      }

      // If no existing room, create a new one
      const response = await api.post('/chat/rooms', {
        type: 'bot',
        name: 'Bot Support',
        participants: [] // Bot room doesn't need additional participants
      });

      if (!response.data?.data?.room) {
        throw new Error('Failed to create bot chat room');
      }

      return response.data.data.room;
    } catch (error) {
      console.error('Error initializing bot chat:', error);
      throw error;
    }
  },

  // Get bot chat history
  getBotChatHistory: async (roomId) => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`, {
        params: {
          messageType: 'bot'
        }
      });

      if (!response.data?.data?.messages) {
        throw new Error('Invalid response format for chat history');
      }

      return response.data.data.messages;
    } catch (error) {
      console.error('Error fetching bot chat history:', error);
      throw error;
    }
  }
};

export default botService;