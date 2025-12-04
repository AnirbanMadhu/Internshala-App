'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';

export const SocketWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <>{children}</>;
  }

  return (
    <SocketProvider userId={user?._id} username={user?.username}>
      {children}
    </SocketProvider>
  );
};
