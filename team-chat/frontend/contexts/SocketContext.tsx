'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { OnlineUser, TypingUser } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: [],
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
  userId?: string;
  username?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, userId, username }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!userId || !username) {
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      // Send user info to server
      socketInstance.emit('user:join', { userId, username });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Handle online users list
    socketInstance.on('users:online', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // Handle user coming online
    socketInstance.on('user:online', (user: OnlineUser) => {
      setOnlineUsers((prev) => {
        // Remove if already exists (reconnection)
        const filtered = prev.filter((u) => u.userId !== user.userId);
        return [...filtered, user];
      });
    });

    // Handle user going offline
    socketInstance.on('user:offline', (data: { userId: string; socketId: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Handle typing indicators
    socketInstance.on('typing:start', (data: TypingUser) => {
      setTypingUsers((prev) => {
        // Add if not already typing
        if (!prev.find((u) => u.userId === data.userId && u.channelId === data.channelId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socketInstance.on('typing:stop', (data: { userId: string; channelId: string }) => {
      setTypingUsers((prev) =>
        prev.filter((u) => !(u.userId === data.userId && u.channelId === data.channelId))
      );
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, username]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, typingUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
