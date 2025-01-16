import React from 'react';
import { Bot } from 'lucide-react';
import Avatar from '../common/Avatar';

const MessageBubble = ({ message, currentUser }) => {
  if (!message) {
    return null;
  }

  const isOwnMessage = currentUser && message.sender && message.sender._id === currentUser._id;
  const isBotMessage = message.messageType === 'bot';

  return (
    <div className={`mb-4 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-start space-x-2 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}>
        <div className="flex-shrink-0">
          {isBotMessage ? (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot size={16} className="text-blue-600" />
            </div>
          ) : (
            <Avatar 
              avatar={message.sender?.avatar}
              name={message.sender?.name || 'User'}
              size="w-8 h-8"
            />
          )}
        </div>
        
        <div className={`max-w-[75%] ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
          {!isOwnMessage && !isBotMessage && message.sender?.name && (
            <span className="text-xs text-gray-500 ml-2">
              {message.sender.name}
            </span>
          )}
          
          <div className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : isBotMessage
                ? 'bg-blue-100 text-gray-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {message.content || 'No message content'}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
            </span>
            {message.readBy?.length > 0 && isOwnMessage && (
              <span className="ml-2">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;