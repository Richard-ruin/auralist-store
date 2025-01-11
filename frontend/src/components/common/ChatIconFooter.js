// frontend/src/components/common/ChatIconFooter.js
import React, { useState } from 'react';
import { MessageCircle, Users, Bot } from 'lucide-react';
import CommunityChat from '../chat/CommunityChat';
import BotAdminChat from '../chat/BotAdminChat';

const ChatIconFooter = () => {
  const [showCommunity, setShowCommunity] = useState(false);
  const [showBotAdmin, setShowBotAdmin] = useState(false);
  const [chatType, setChatType] = useState('bot');

  return (
    <>
      <div className="fixed bottom-0 w-full px-4 py-2 flex justify-between z-40">
        {/* Community Chat Icon */}
        <div className="relative">
          <button
            onClick={() => setShowCommunity(!showCommunity)}
            className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300"
          >
            <Users size={24} />
            <span className={`${showCommunity ? 'inline' : 'hidden'} text-sm`}>
              Community
            </span>
          </button>
        </div>

        {/* Bot & Admin Chat Icon */}
        <div className="relative">
          <button
            onClick={() => setShowBotAdmin(!showBotAdmin)}
            className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300"
          >
            {chatType === 'bot' ? <Bot size={24} /> : <MessageCircle size={24} />}
            <span className={`${showBotAdmin ? 'inline' : 'hidden'} text-sm`}>
              {chatType === 'bot' ? 'Chat Bot' : 'Admin Support'}
            </span>
          </button>
        </div>
      </div>

      {/* Chat Components */}
      <CommunityChat 
        isOpen={showCommunity} 
        onClose={() => setShowCommunity(false)} 
      />
      <BotAdminChat 
        isOpen={showBotAdmin}
        onClose={() => setShowBotAdmin(false)}
        initialType={chatType}
      />
    </>
  );
};

export default ChatIconFooter;