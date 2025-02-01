import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import chatService from '../../services/chatService';
import Avatar from '../common/Avatar';
import { toast } from 'react-hot-toast';

const AdminChatWindow = ({ room, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (room?._id) {
      fetchMessages();
      scrollToBottom();
    }
  }, [room?._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for room:', room._id); // Debug log
      const response = await chatService.getRoomMessages(room._id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !room?._id) return;

    try {
      console.log('Sending message to room:', room._id); // Debug log
      const response = await chatService.sendMessage(room._id, messageInput);
      
      if (response.data?.message) {
        setMessages(prev => [...prev, response.data.message]);
        setMessageInput('');
        if (onMessageSent) {
          onMessageSent(response.data.message);
        }
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              avatar={room.participants.find(p => p.role === 'user')?.user?.avatar}
              name={room.participants.find(p => p.role === 'user')?.user?.name || 'Unknown User'}
              size="w-10 h-10"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">
                {room.participants.find(p => p.role === 'user')?.user?.name}
              </p>
              <p className="text-sm text-gray-500">
                {room.isActive ? 'Active' : 'Closed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[70%] ${
                  message.sender?._id === user._id ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <Avatar
                    avatar={message.sender?.avatar}
                    name={message.sender?.name || 'Unknown'}
                    size="w-8 h-8"
                  />
                  <div className={`mx-2 ${
                    message.sender?._id === user._id ? 'bg-indigo-600 text-white' : 'bg-white'
                  } rounded-lg p-3 shadow-sm`}>
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminChatWindow;