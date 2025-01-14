// context/ChatContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();
  
  // Fetch rooms based on type
  const fetchRooms = async (type = 'community') => {
    try {
      const response = await api.get('/chat/rooms', {
        params: { type }
      });
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Create new room
  const createRoom = async (name, type = 'community', participantIds = []) => {
    try {
      const response = await api.post('/chat/rooms', {
        name,
        type,
        participantIds
      });
      setRooms(prev => [...prev, response.data.data.room]);
      return response.data.data.room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async (roomId, content) => {
    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content
      });
      return response.data.data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const value = {
    rooms,
    messages,
    activeRoom,
    setActiveRoom,
    fetchRooms,
    createRoom,
    fetchMessages,
    sendMessage
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