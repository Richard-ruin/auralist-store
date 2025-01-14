// components/chat/CommunityChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import Avatar from '../common/Avatar';

const CommunityChat = ({ isOpen, onClose }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch channels when component opens
  useEffect(() => {
    if (isOpen) {
      fetchChannels();
    }
  }, [isOpen]);

  // Handle channel change
  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel._id);
      joinChannel(activeChannel._id);
    }
  }, [activeChannel]);

  // Socket connection handling
  useEffect(() => {
    if (socket && activeChannel) {
      console.log('Setting up socket for channel:', activeChannel._id);
      
      socket.emit('joinChannel', activeChannel._id);

      const handleNewMessage = (message) => {
        console.log('New message received:', message);
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        console.log('Cleaning up socket for channel:', activeChannel._id);
        socket.off('newMessage', handleNewMessage);
        socket.emit('leaveChannel', activeChannel._id);
      };
    }
  }, [socket, activeChannel]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/community/channels');
      setChannels(response.data.data.channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/rooms/${channelId}/messages`);
      console.log('Fetched messages:', response.data.data.messages);
      setMessages(response.data.data.messages);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChannel = async (channelId) => {
    try {
      await api.post(`/community/channels/${channelId}/join`);
      if (socket) {
        socket.emit('joinChannel', channelId);
      }
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    try {
      const response = await api.post(`/chat/channels/${activeChannel._id}/messages`, {
        content: messageInput
      });

      // Add the new message to the messages array immediately
      const newMessage = response.data.data.message;
      console.log('New message sent:', newMessage);
      
      setMessages(prev => [...prev, {
        ...newMessage,
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        }
      }]);
      
      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        {/* Channels Sidebar */}
        <div className="w-1/3 border-r bg-gray-50">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-sm text-gray-700">Channels</h4>
          </div>
          <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 45px)' }}>
            {loading && channels.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel._id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                      activeChannel?._id === channel._id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    # {channel.channel}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-white">
          {activeChannel ? (
            <>
              {/* Channel Header */}
              <div className="p-3 border-b bg-white">
                <h3 className="font-semibold text-gray-800">
                  # {activeChannel.channel}
                </h3>
                {activeChannel.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activeChannel.description}
                  </p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Loading messages...</div>
                ) : (
                  <>
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
                          <div className={`flex items-start mb-1 ${
  message.sender._id === user._id ? 'flex-row-reverse' : 'flex-row'
} space-x-2`}>
  <Avatar 
    avatar={message.sender.avatar}
    name={message.sender.name}
    size="w-8 h-8"
    textSize="text-sm"
  />
  <div className={message.sender._id === user._id ? 'mr-2' : 'ml-2'}>
    {/* Rest of the message content */}
  </div>
</div>
                          <div className={message.sender._id === user._id ? 'mr-2' : 'ml-2'}>
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
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
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
                    disabled={!messageInput.trim()}
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