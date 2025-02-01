import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import chatService from '../../services/chatService';
import AdminChatWindow from './AdminChatWindow';
import Avatar from '../common/Avatar';

const ChatManager = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const socket = useSocket();

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAdminRooms();
      console.log('Full API Response:', response); // Debug full response
      
      if (!response.data.rooms || !Array.isArray(response.data.rooms)) {
        console.error('Invalid rooms data:', response.data);
        toast.error('Invalid response format');
        return;
      }
  
      // Debug each room's data
      response.data.rooms.forEach((room, index) => {
        console.log(`Room ${index + 1}:`, {
          id: room._id,
          participants: room.participants,
          userParticipant: room.participants?.find(p => p.role === 'user'),
          lastMessage: room.lastMessage
        });
      });
  
      setChatRooms(response.data.rooms);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError(err.message || 'Failed to fetch chat rooms');
      toast.error('Failed to fetch chat rooms');
    } finally {
      setLoading(false);
    }
  };

  // Di dalam fetchChatRooms


  useEffect(() => {
    fetchChatRooms();

    if (socket) {
      // Listen for new messages
      socket.on('newMessage', (message) => {
        setChatRooms(prevRooms => 
          prevRooms.map(room => {
            if (room._id === message.roomId) {
              return { ...room, lastMessage: message };
            }
            return room;
          })
        );
      });

      // Listen for room updates
      socket.on('roomUpdate', (updatedRoom) => {
        setChatRooms(prevRooms =>
          prevRooms.map(room =>
            room._id === updatedRoom._id ? updatedRoom : room
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('roomUpdate');
      }
    };
  }, [socket]);

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    try {
      await chatService.markMessagesAsRead(room._id);
      // Update room in the list to reflect read status
      setChatRooms(prevRooms =>
        prevRooms.map(prevRoom =>
          prevRoom._id === room._id
            ? { ...prevRoom, unreadCount: 0 }
            : prevRoom
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleStatusToggle = async (roomId, currentStatus) => {
    try {
      await chatService.updateRoomStatus(roomId, !currentStatus);
      await fetchChatRooms();
      toast.success(`Chat ${currentStatus ? 'closed' : 'reopened'} successfully`);
    } catch (error) {
      toast.error('Failed to update chat status');
    }
  };

  const handleMessageSent = (newMessage) => {
    // Update the room's last message in the list
    setChatRooms(prevRooms =>
      prevRooms.map(room =>
        room._id === newMessage.roomId
          ? { ...room, lastMessage: newMessage }
          : room
      )
    );
  };

  const filteredRooms = chatRooms.filter(room => 
    room.participants.some(participant => 
      participant.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">Customer Chats</h1>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chats found</h3>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const userParticipant = room.participants?.find(p => p.role === 'user');
              const userData = userParticipant?.user || {};
              console.log('User data for room:', room._id, userData);

              return (
                <div
                  key={room._id}
                  onClick={() => handleRoomSelect(room)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    selectedRoom?._id === room._id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      avatar={userData.avatar}
                      name={userData.name || 'Unknown User'}
                      size="w-10 h-10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userData.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {room.lastMessage ? format(new Date(room.lastMessage.createdAt), 'MMM d, HH:mm') : ''}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-500">{userData.email}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {room.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusToggle(room._id, room.isActive);
                          }}
                          className={`ml-2 ${
                            room.isActive
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                        >
                          {room.isActive ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedRoom ? (
          <AdminChatWindow
            room={selectedRoom}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a chat from the list to view the conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManager;