'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  channelId: string;
  onSendMessage: (content: string) => Promise<void>;
  typingUsers: string[];
}

export const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  onSendMessage,
  typingUsers,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Cleanup typing indicator when channel changes
    return () => {
      if (isTypingRef.current && socket && user) {
        socket.emit('typing:stop', {
          channelId,
          userId: user._id,
        });
        isTypingRef.current = false;
      }
    };
  }, [channelId, socket, user]);

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!socket || !user) return;

    // Emit typing start indicator
    if (value && !isTypingRef.current) {
      socket.emit('typing:start', {
        channelId,
        userId: user._id,
        username: user.username,
      });
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && socket) {
        socket.emit('typing:stop', {
          channelId,
          userId: user._id,
        });
        isTypingRef.current = false;
      }
    }, 2000);

    // Stop immediately if message is empty
    if (!value && isTypingRef.current) {
      socket.emit('typing:stop', {
        channelId,
        userId: user._id,
      });
      isTypingRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending) return;

    setSending(true);

    // Stop typing indicator
    if (isTypingRef.current && socket && user) {
      socket.emit('typing:stop', {
        channelId,
        userId: user._id,
      });
      isTypingRef.current = false;
    }

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-gray-300 p-4 bg-white">
      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 mb-2 italic">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !message.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};
