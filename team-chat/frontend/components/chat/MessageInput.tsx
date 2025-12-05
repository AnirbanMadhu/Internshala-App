'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Paperclip, X, Image, Video, FileText, Music } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface MessageInputProps {
  channelId: string;
  onSendMessage: (content: string, file?: File) => Promise<void>;
  typingUsers: string[];
}

export const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  onSendMessage,
  typingUsers,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if ((!trimmedMessage && !selectedFile) || sending) return;

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
      await onSendMessage(trimmedMessage || '', selectedFile || undefined);
      setMessage('');
      removeFile();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="border-t border-gray-200 p-4 bg-gradient-to-r from-white to-gray-50"
    >
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-gray-700 mb-3 italic"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex gap-1"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            </motion.div>
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-3 p-3 bg-white border-2 border-blue-300 rounded-xl flex items-center gap-3"
        >
          {filePreview ? (
            <img
              src={filePreview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600">
              {getFileIcon(selectedFile)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={removeFile}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            type="button"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          whileHover={{ scale: sending ? 1 : 1.05 }}
          whileTap={{ scale: sending ? 1 : 0.95 }}
          className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Paperclip className="w-5 h-5" />
        </motion.button>
        <motion.input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          whileFocus={{ scale: 1.01 }}
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <motion.button
          type="submit"
          disabled={sending || (!message.trim() && !selectedFile)}
          whileHover={{ scale: sending || (!message.trim() && !selectedFile) ? 1 : 1.05 }}
          whileTap={{ scale: sending || (!message.trim() && !selectedFile) ? 1 : 0.95 }}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${
            sending || (!message.trim() && !selectedFile)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/50'
          } text-white`}
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};
