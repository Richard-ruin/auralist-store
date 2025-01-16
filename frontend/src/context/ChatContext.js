// context/ChatContext.js
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import botService from '../services/botService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const FETCH_COOLDOWN = 5000;

  const { user, refreshToken } = useAuth();

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      // Sort messages by createdAt in ascending order (oldest first)
      const sortedMessages = response.data.data.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return fetchMessages(roomId);
      }
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const fetchRooms = async (type = 'all') => {
    if (isLoading) return;

    if (lastFetch && Date.now() - lastFetch < FETCH_COOLDOWN) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/chat/rooms', {
        params: { type }
      });
      setRooms(response.data.data.rooms);
      setLastFetch(Date.now());
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return fetchRooms(type);
      }
      console.error('Error fetching rooms:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (roomId, content, messageType = 'direct') => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
  
    try {
      // Kirim pesan user
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content,
        messageType
      });
  
      // Jika ini chat bot, tunggu respons bot
      if (messageType === 'bot') {
        setIsBotTyping(true);
        try {
          const botResponse = await botService.generateResponse(content, roomId);
          // Refresh pesan setelah mendapat respons bot
          await fetchMessages(roomId);
          return botResponse;
        } finally {
          setIsBotTyping(false);
        }
      }
  
      // Refresh pesan untuk tipe chat lainnya
      await fetchMessages(roomId);
      return response.data.data.message;
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return sendMessage(roomId, content, messageType);
      }
      console.error('Error sending message:', error);
      throw error;
    }
  };
  
  const initializeBotChat = async () => {
    try {
      // Cari room bot yang sudah ada
      const roomsResponse = await api.get('/chat/rooms', {
        params: { type: 'bot' }
      });
  
      let botRoom = roomsResponse.data.data.rooms?.[0];
  
      if (!botRoom) {
        // Buat room bot baru jika belum ada
        const newRoomResponse = await botService.initializeBotChat();
        botRoom = newRoomResponse;
      }
  
      // Set active room
      setActiveRoom(botRoom);
      
      // Fetch messages untuk room ini
      if (botRoom._id) {
        await fetchMessages(botRoom._id);
      }
  
      return botRoom;
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return initializeBotChat();
      }
      console.error('Error initializing bot chat:', error);
      throw error;
    }
  };


  const initializeAdminChat = async () => {
    try {
      // Try to find existing admin room first
      const roomsResponse = await api.get('/chat/rooms', {
        params: { type: 'admin' }
      });

      const existingAdminRoom = roomsResponse.data.data.rooms[0];
      if (existingAdminRoom) {
        return existingAdminRoom;
      }

      // If no existing room, create new one
      const response = await api.post('/chat/rooms', {
        type: 'admin',
        name: 'Admin Support'
      });
      
      return response.data.data.room;
    } catch (error) {
      if (error.response?.status === 401) {
        await refreshToken();
        return initializeAdminChat();
      }
      throw error;
    }
  };

  const value = {
    rooms,
    messages,
    activeRoom,
    isLoading,
    setActiveRoom,
    fetchRooms,
    fetchMessages,
    sendMessage,
    initializeBotChat,
    initializeAdminChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;