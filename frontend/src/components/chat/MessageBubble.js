import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/avatar';
const MessageBubble = ({ message, isOwnMessage, user }) => {
    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
  
    return (
      <div
        className={`mb-4 ${
          isOwnMessage ? 'text-right' : 'text-left'
        }`}
      >
        <div className={`flex items-start mb-1 ${
          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
        } space-x-2`}>
          <div className={`${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
            <Avatar user={message.sender} />
          </div>
          <div className={message.sender._id === user._id ? 'mr-2' : 'ml-2'}>
            <p className="text-xs text-gray-600 mb-1">
              {message.sender.name}
            </p>
            <div
              className={`px-4 py-2 rounded-lg max-w-[200px] break-words ${
                isOwnMessage
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
    );
  };