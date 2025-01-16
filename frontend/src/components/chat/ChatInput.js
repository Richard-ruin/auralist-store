

// frontend/src/components/chat/ChatInput.js
import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ messageInput, setMessageInput, isLoading, onSubmit, chatType }) => (
  <form onSubmit={onSubmit} className="p-4 border-t">
    <div className="flex space-x-2">
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder={`Type your message to ${chatType === 'bot' ? 'Bot' : 'Admin'}...`}
        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`p-2 rounded-full ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white transition-colors`}
        disabled={isLoading}
      >
        <Send size={20} />
      </button>
    </div>
  </form>
);

export default ChatInput;