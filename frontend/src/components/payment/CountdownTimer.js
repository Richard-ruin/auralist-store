import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ minutes = 5, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    if (timeLeft === 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center bg-orange-50 rounded-lg p-4 border border-orange-200">
      <Clock className="w-5 h-5 text-orange-500 mr-2" />
      <span className="text-orange-700 font-medium mr-2">
        Payment expires in:
      </span>
      <span className="font-mono text-lg font-bold text-orange-700">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default CountdownTimer;