// frontend/src/components/chat/BotChat.js
import React from 'react';
import BaseChat from './BaseChat';

const BotChat = ({ isOpen, onClose }) => {
  return (
    <BaseChat
      isOpen={isOpen}
      onClose={onClose}
      chatType="bot"
      onChatTypeChange={() => {}}
    />
  );
};

export default BotChat;
