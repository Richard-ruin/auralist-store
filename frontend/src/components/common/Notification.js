// components/common/Notification.js
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Notification = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 mr-2" />
      ) : (
        <XCircle className="w-5 h-5 mr-2" />
      )}
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;