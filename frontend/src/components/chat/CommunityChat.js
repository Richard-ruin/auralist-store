// frontend/src/components/chat/CommunityChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CommunityChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchChannels();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel);
    }
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/community/channels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setChannels(data.data.channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      const response = await fetch(`/api/community/channels/${channelId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMessages(data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel) return;

    try {
      const response = await fetch(`/api/chat/rooms/${activeChannel}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: messageInput,
          messageType: 'community'
        })
      });

      if (response.ok) {
        setMessageInput('');
        // Refresh messages
        fetchMessages(activeChannel);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={`fixed bottom-20 left-4 w-96 bg-white rounded-lg shadow-xl border transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-900 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Users size={20} />
          <h3 className="font-semibold">Community Chat</h3>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="h-[32rem] flex">
        {/* Channels Sidebar */}
        <div className="w-1/3 border-r p-4 overflow-y-auto">
          <h4 className="font-semibold mb-3">Channels</h4>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => setActiveChannel(channel._id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeChannel === channel._id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                # {channel.channel}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {activeChannel ? (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`mb-4 ${
                      message.sender._id === user._id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className="flex items-start mb-1 space-x-2">
                      <img
                        src={message.sender.avatar || '/default-avatar.png'}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold">{message.sender.name}</p>
                        <div className={`mt-1 px-4 py-2 rounded-lg ${
                          message.sender._id === user._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100'
                        }`}>
                          {message.content}
                        </div>
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
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a channel to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;