'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { Message } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://internshala-app-2xt0.onrender.com';

interface SearchMessagesProps {
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SearchMessages: React.FC<SearchMessagesProps> = ({
  channelId,
  isOpen,
  onClose,
}) => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/messages/search?channelId=${channelId}&query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.messages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-5 md:mb-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Search Messages</h2>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </div>

            <motion.form
              onSubmit={handleSearch}
              className="mb-3 sm:mb-4 md:mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 transition-all duration-200"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || !query.trim()}
                  whileHover={{ scale: loading || !query.trim() ? 1 : 1.05 }}
                  whileTap={{ scale: loading || !query.trim() ? 1 : 0.95 }}
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all shadow-lg flex items-center justify-center gap-2 ${
                    loading || !query.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/50'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Search</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border-2 border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3">
              <AnimatePresence mode="popLayout">
                {results.length > 0 ? (
                  results.map((message, index) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {message.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm sm:text-base text-gray-900">{message.username}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 pl-9 sm:pl-0">
                          {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{message.content}</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 sm:py-12 md:py-16"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex justify-center mb-3 sm:mb-4"
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl">
                        <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" />
                      </div>
                    </motion.div>
                    <p className="text-gray-700 font-medium text-sm sm:text-base md:text-lg px-4">
                      {query && !loading ? 'No messages found' : 'Enter a search term to find messages'}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 px-4">
                      Try different keywords or check your spelling
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
