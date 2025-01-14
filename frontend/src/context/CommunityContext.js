// components/chat/CommunityChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

const CommunityChat = ({ isOpen, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch community rooms when component opens
  useEffect(() => {
    if (isOpen) {
      fetchCommunityRooms();
    }
  }, [isOpen]);

  // Handle room change
  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom._id);
      joinRoom(activeRoom._id);
    }
  }, [activeRoom]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection handling
  useEffect(() => {
    if (socket && activeRoom) {
      socket.emit('joinRoom', activeRoom._id);

      socket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('newMessage');
        socket.emit('leaveRoom', activeRoom._id);
      };
    }
  }, [socket, activeRoom]);

  const fetchCommunityRooms = async () => {
    try {
      const response = await api.get('/chat/rooms', {
        params: { type: 'community' }
      });
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching community rooms:', error);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      if (socket) {
        socket.emit('joinRoom', roomId);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom) return;

    try {
      await api.post(`/chat/rooms/${activeRoom._id}/messages`, {
        content: messageInput
      });

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div
      className={`fixed bottom-20 left-4 w-96 bg-white rounded-lg shadow-xl border transition-all duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-900 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Users size={18} />
          <h3 className="font-semibold text-sm">Community Chat</h3>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Rooms Sidebar */}
        <div className="w-1/3 border-r p-4 overflow-y-auto">
          <h4 className="font-semibold mb-3 text-sm">Channels</h4>
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => setActiveRoom(room)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                  activeRoom?._id === room._id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                # {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {activeRoom ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`mb-4 ${
                      message.sender._id === user._id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className={`flex items-start mb-1 ${
                      message.sender._id === user._id ? 'flex-row-reverse' : 'flex-row'
                    } space-x-2`}>
                      <img
                        src={message.sender.avatar || '/default-avatar.png'}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          {message.sender.name}
                        </p>
                        <div
                          className={`px-4 py-2 rounded-lg max-w-[200px] break-words ${
                            message.sender._id === user._id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {message.content}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a channel to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;

