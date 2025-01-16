// components/admin/ChatManager.js
import React, { useEffect, useState, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { MessageSquare, Users, X } from 'lucide-react';
import Avatar from '../common/Avatar';

const ChatManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { rooms, messages, fetchRooms, fetchMessages, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const { user } = useAuth();

  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchRooms();
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRooms]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadRooms();
    }
    return () => {
      mounted = false;
    };
  }, [loadRooms]);

  const handleRoomClick = async (room) => {
    setSelectedRoom(room);
    await fetchMessages(room._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      await sendMessage(selectedRoom._id, messageInput);
      setMessageInput('');
      await fetchMessages(selectedRoom._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatLastMessage = (room) => {
    if (!room.lastMessage) return 'No messages yet';
    return room.lastMessage.content.length > 30 
      ? room.lastMessage.content.substring(0, 30) + '...'
      : room.lastMessage.content;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Chat List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="border-r">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">Chat Management</h1>
            </div>
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
              {rooms.map(room => (
                <div
                  key={room._id}
                  onClick={() => handleRoomClick(room)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedRoom?._id === room._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      avatar={room.participants[0]?.user?.avatar}
                      name={room.participants[0]?.user?.name || 'User'}
                      size="w-10 h-10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {room.participants[0]?.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {formatLastMessage(room)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {room.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="col-span-2">
            {selectedRoom ? (
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      avatar={selectedRoom.participants[0]?.user?.avatar}
                      name={selectedRoom.participants[0]?.user?.name || 'User'}
                      size="w-10 h-10"
                    />
                    <div>
                      <h2 className="font-medium">
                        {selectedRoom.participants[0]?.user?.name || 'Unknown User'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedRoom.type} chat
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4"
                  style={{ height: 'calc(100vh - 300px)' }}
                >
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`mb-4 flex ${
                        message.sender._id === user._id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender._id === user._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs mt-1 text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatManager;