'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Lock, Plus, RefreshCw, LogOut, Wifi, WifiOff, X } from 'lucide-react';
import { Channel } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

interface SidebarProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: () => void;
  onRefreshChannels: () => void;
  unreadCounts?: Record<string, number>;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  selectedChannelId,
  onChannelSelect,
  onCreateChannel,
  onRefreshChannels,
  unreadCounts = {},
  isOpen = true,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  const handleChannelSelect = (channelId: string) => {
    onChannelSelect(channelId);
    // Close sidebar on mobile after selection
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && onClose && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`
          fixed md:relative
          w-64 sm:w-72 md:w-64 lg:w-72
          bg-gradient-to-b from-gray-900 to-gray-800 text-white
          flex flex-col h-screen shadow-2xl
          z-50 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform md:transition-none
        `}
      >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-3 sm:p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Team Chat
          </h1>
          {/* Close button for mobile */}
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-300 font-medium truncate mr-2">{user?.username}</span>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.div
              animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1"
              title={isConnected ? 'Connected' : 'Disconnected'}
            >
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Channels
          </h2>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCreateChannel}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Create channel"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <motion.div className="space-y-1">
          <AnimatePresence>
            {channels.map((channel, index) => (
              <motion.button
                key={channel._id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChannelSelect(channel._id)}
                className={`w-full text-left px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 ${
                  selectedChannelId === channel._id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    {channel.isPrivate ? (
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate font-medium text-sm sm:text-base">{channel.name}</span>
                  </div>
                  {unreadCounts[channel._id] && unreadCounts[channel._id] > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2 flex-shrink-0 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadCounts[channel._id] > 99 ? '99+' : unreadCounts[channel._id]}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {channels.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-400 text-sm text-center py-8"
          >
            <p className="mb-2">No channels yet</p>
            <p className="text-xs text-gray-500">Create one to get started!</p>
          </motion.div>
        )}
      </div>

      {/* Refresh button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900/30"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefreshChannels}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg text-sm sm:text-base"
        >
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.div>
          <span className="font-medium">Refresh Channels</span>
        </motion.button>
      </motion.div>
    </motion.div>
    </>
  );
};
