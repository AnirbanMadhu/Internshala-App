'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Check, X, Loader2, FileText, Download } from 'lucide-react';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://internshala-app-2xt0.onrender.com';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

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

  const renderFileAttachment = (message: Message) => {
    if (!message.fileUrl) return null;

    const fileUrl = `${API_URL}${message.fileUrl}`;

    switch (message.fileType) {
      case 'image':
        return (
          <div className="mt-1.5 sm:mt-2">
            <img
              src={fileUrl}
              alt={message.fileName || 'Image'}
              className="max-w-[200px] sm:max-w-xs rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
        );

      case 'video':
        return (
          <div className="mt-1.5 sm:mt-2">
            <video
              controls
              className="max-w-[200px] sm:max-w-xs rounded-lg shadow-md"
              src={fileUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="mt-1.5 sm:mt-2">
            <audio controls className="w-full max-w-[200px] sm:max-w-xs">
              <source src={fileUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'document':
      case 'other':
      default:
        return (
          <motion.a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all border border-white border-opacity-30"
          >
            <div className="p-1.5 sm:p-2 bg-white bg-opacity-30 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{message.fileName}</p>
              {message.fileSize && (
                <p className="text-[10px] sm:text-xs opacity-80">
                  {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.a>
        );
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 bg-gradient-to-b from-gray-50 to-white"
    >
      <AnimatePresence>
        {loading && hasMore && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm py-2 sm:py-3"
          >
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span className="hidden sm:inline">Loading more messages...</span>
            <span className="sm:hidden">Loading...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => {
          const isOwnMessage = message.userId === user?._id;
          const isEditing = editingMessageId === message._id;

          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.02 }}
              layout
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg ${
                  isOwnMessage
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-lg'
                } rounded-2xl px-3 py-2 sm:px-4 sm:py-3 transition-all duration-200`}
              >
                {!isOwnMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] sm:text-xs font-bold mb-1 sm:mb-1.5 text-blue-600"
                  >
                    {message.username}
                  </motion.div>
                )}

                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1.5 sm:space-y-2"
                  >
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 sm:p-2.5 border-2 border-blue-500 rounded-lg text-sm sm:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-1.5 sm:gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveEdit(message._id)}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md transition-colors"
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                        <span className="sm:hidden">✓</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Cancel</span>
                        <span className="sm:hidden">✕</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {message.content && (
                      <div className="break-words leading-relaxed text-sm sm:text-base">{message.content}</div>
                    )}

                    {renderFileAttachment(message)}

                    <div className="flex items-center justify-between mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-opacity-20 border-white">
                      <div className={`text-[10px] sm:text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                        {message.edited && (
                          <span className="ml-1 italic text-[10px] sm:text-xs">(edited)</span>
                        )}
                      </div>

                      {isOwnMessage && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-1 sm:gap-2"
                        >
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(message)}
                            className="p-1 sm:p-1.5 hover:bg-blue-700 rounded-lg transition-all"
                            title="Edit message"
                          >
                            <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteMessage(message._id)}
                            className="p-1 sm:p-1.5 hover:bg-blue-700 rounded-lg transition-all"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
};
