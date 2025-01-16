import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import { useChat } from '../../context/ChatContext';

const BaseChat = ({ isOpen, onClose, chatType, onChatTypeChange }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { user } = useAuth();
  const {
    messages,
    activeRoom,
    setActiveRoom,
    fetchMessages,
    sendMessage,
    initializeBotChat,
    initializeAdminChat,
  } = useChat();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        let room;
        if (chatType === 'bot') {
          room = await initializeBotChat();
        } else if (chatType === 'admin') {
          room = await initializeAdminChat();
        }
        
        if (room && room._id) {
          setActiveRoom(room);
          await fetchMessages(room._id);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, chatType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom?._id || isLoading) return;

    setIsLoading(true);
    try {
      await sendMessage(activeRoom._id, messageInput, chatType);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border transition-all duration-300 ${
      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`} style={{ maxHeight: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-900 text-white rounded-t-lg">
        <div className="flex space-x-3">
          <button
            onClick={() => onChatTypeChange('bot')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              chatType === 'bot'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bot size={16} />
            <span>Chat Bot</span>
          </button>
          <button
            onClick={() => onChatTypeChange('admin')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              chatType === 'admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <MessageCircle size={16} />
            <span>Live Support</span>
          </button>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-4">
              {chatType === 'bot' ? (
                <p>Hello! I'm your virtual assistant. How can I help you today?</p>
              ) : (
                <p>Connect with our support team. We typically reply within minutes.</p>
              )}
            </div>
          )}
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              message && (
                <MessageBubble
                  key={message._id || Date.now()}
                  message={message}
                  currentUser={user}
                />
              )
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Type your message to ${chatType === 'bot' ? 'Bot' : 'Support'}...`}
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`p-2 rounded-full ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </div>
          {isLoading && (
            <p className="text-xs text-gray-500 mt-2">Sending message...</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default BaseChat;