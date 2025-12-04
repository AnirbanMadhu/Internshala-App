'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onLoadMore,
  hasMore,
  loading,
  onEditMessage,
  onDeleteMessage,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if scrolled to top
    if (container.scrollTop === 0 && hasMore && !loading) {
      const scrollHeight = container.scrollHeight;
      onLoadMore();

      // Maintain scroll position after loading
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight - scrollHeight;
        }
      }, 100);
    }

    // Check if near bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);
  };

  const startEdit = (message: Message) => {
    setEditingMessageId(message._id);
    setEditContent(message.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const saveEdit = (messageId: string) => {
    if (editContent.trim()) {
      onEditMessage(messageId, editContent.trim());
      cancelEdit();
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {loading && hasMore && (
        <div className="text-center text-gray-500 text-sm py-2">
          Loading more messages...
        </div>
      )}

      {messages.map((message) => {
        const isOwnMessage = message.userId === user?._id;
        const isEditing = editingMessageId === message._id;

        return (
          <div
            key={message._id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              } rounded-lg px-4 py-2`}
            >
              {!isOwnMessage && (
                <div className="text-xs font-semibold mb-1">{message.username}</div>
              )}

              {isEditing ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded text-gray-800"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => saveEdit(message._id)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="break-words">{message.content}</div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-75">
                      {format(new Date(message.createdAt), 'HH:mm')}
                      {message.edited && ' (edited)'}
                    </div>

                    {isOwnMessage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(message)}
                          className="text-xs opacity-75 hover:opacity-100"
                          title="Edit message"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteMessage(message._id)}
                          className="text-xs opacity-75 hover:opacity-100"
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};
