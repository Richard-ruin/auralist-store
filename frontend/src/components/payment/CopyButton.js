import React, { useState } from 'react';
import { Copy, ClipboardCheck } from 'lucide-react';

const CopyButton = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-colors ${className}`}
    >
      {copied ? (
        <ClipboardCheck className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
    </button>
  );
};

export default CopyButton;