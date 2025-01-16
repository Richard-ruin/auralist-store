

// frontend/src/components/chat/BotAdminChat.js
import React, { useState } from 'react';
import BaseChat from './BaseChat';

const BotAdminChat = ({ isOpen, onClose, initialType = 'bot' }) => {
  const [chatType, setChatType] = useState(initialType);

  return (
    <BaseChat
      isOpen={isOpen}
      onClose={onClose}
      chatType={chatType}
      onChatTypeChange={setChatType}
    />
  );
};

export default BotAdminChat;