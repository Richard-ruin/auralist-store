
// frontend/src/components/chat/AdminChat.js
import React from 'react';
import BaseChat from './BaseChat';

const AdminChat = ({ isOpen, onClose }) => {
  return (
    <BaseChat
      isOpen={isOpen}
      onClose={onClose}
      chatType="admin"
      onChatTypeChange={() => {}}
    />
  );
};

export default AdminChat;