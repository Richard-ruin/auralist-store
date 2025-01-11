// frontend/src/components/chat/BotAdminChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const BotAdminChat = ({ isOpen, onClose, initialType = 'bot' }) => {
  const [chatType, setChatType] = useState(initialType);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, chatType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/${chatType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMessages(data.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/rooms/${chatType}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: messageInput,
          messageType: chatType
        })
      });

      if (response.ok) {
        const newMessage = {
          _id: Date.now(),
          content: messageInput,
          sender: user,
          createdAt: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');

        // If it's a bot chat, get bot response
        if (chatType === 'bot') {
          const botResponse = await fetch('/api/chatbot/response', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              message: messageInput
            })
          });

          if (botResponse.ok) {
            const data = await botResponse.json();
            setMessages(prev => [...prev, data.data.message]);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border transition-all duration-300 ${
      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-900 text-white rounded-t-lg">
        <div className="flex space-x-4">
          <button
            onClick={() => setChatType('bot')}
            className={`flex items-center space-x-2 px-3 py-1 rounded ${
              chatType === 'bot'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bot size={20} />
            <span>Chat Bot</span>
          </button>
          <button
            onClick={() => setChatType('admin')}
            className={`flex items-center space-x-2 px-3 py-1 rounded ${
              chatType === 'admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <MessageCircle size={20} />
            <span>Admin</span>
          </button>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="h-[32rem] flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`mb-4 ${
                message.sender?._id === user._id ? 'text-right' : 'text-left'
              }`}
            >
              <div className={`flex items-start space-x-2 ${
                message.sender?._id === user._id ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="flex-shrink-0">
                  {message.sender ? (
                    <img
                      src={message.sender.avatar || '/default-avatar.png'}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot size={16} className="text-blue-600" />
                    </div>
                  )}
                </div>
                <div className={`max-w-[75%] ${
                  message.sender?._id === user._id ? 'ml-auto' : 'mr-auto'
                }`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    message.sender?._id === user._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}>
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

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Type your message to ${chatType === 'bot' ? 'Bot' : 'Admin'}...`}
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
        </form>
      </div>
    </div>
  );
};

export default BotAdminChat;