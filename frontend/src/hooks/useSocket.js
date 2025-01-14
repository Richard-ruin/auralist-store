// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.REACT_APP_API_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  return socketRef.current;
};