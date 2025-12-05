'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User as UserIcon, X } from 'lucide-react';
import { Channel, User } from '@/types';
import { useSocket } from '@/contexts/SocketContext';

interface ChannelMembersProps {
  channel: Channel;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChannelMembers: React.FC<ChannelMembersProps> = ({ channel, isOpen = true, onClose }) => {
  const { onlineUsers } = useSocket();

  // Separate members into online and offline
  const { onlineMembers, offlineMembers } = useMemo(() => {
    const online: User[] = [];
    const offline: User[] = [];

    channel.members.forEach((member) => {
      const isOnline = onlineUsers.some((u) => u.userId === member._id);
      if (isOnline) {
        online.push({ ...member, isOnline: true });
      } else {
        offline.push({ ...member, isOnline: false });
      }
    });

    return { onlineMembers: online, offlineMembers: offline };
  }, [channel.members, onlineUsers]);

  const totalMembers = channel.members.length;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && onClose && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Members Panel */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`
          fixed lg:relative
          right-0 lg:right-auto
          w-64 sm:w-72 md:w-64 lg:w-72
          bg-gradient-to-b from-slate-100 to-slate-50
          border-l border-slate-300
          flex flex-col h-screen shadow-lg
          z-50 lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
      >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-3 sm:p-4 lg:p-5 border-b border-slate-300 bg-gradient-to-r from-purple-600 to-blue-600"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Members
              </h2>
              <p className="text-xs text-purple-100">{totalMembers} {totalMembers === 1 ? 'member' : 'members'}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="lg:hidden text-white hover:text-purple-100 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        {/* Online Members Section */}
        {onlineMembers.length > 0 && (
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3 px-1 sm:px-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Online — {onlineMembers.length}
              </h3>
            </div>
            <div className="space-y-1">
              {onlineMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white hover:bg-purple-50 hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-purple-200"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-lg shadow-green-500/50"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                      {member.username}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Active now</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Members Section */}
        {offlineMembers.length > 0 && (
          <div className={`p-3 sm:p-4 ${onlineMembers.length > 0 ? 'border-t border-slate-200' : ''}`}>
            <div className="flex items-center gap-2 mb-3 px-1 sm:px-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Offline — {offlineMembers.length}
              </h3>
            </div>
            <div className="space-y-1">
              {offlineMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: (onlineMembers.length + index) * 0.03 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white hover:bg-slate-200 hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-slate-300"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                      {member.username}
                    </p>
                    <p className="text-xs text-slate-500">Offline</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalMembers === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center h-full flex flex-col items-center justify-center"
          >
            <div className="p-4 bg-white rounded-full mb-4 shadow-lg">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">No members yet</p>
            <p className="text-sm text-slate-500 mt-1">Invite people to join this channel</p>
          </motion.div>
        )}
      </div>
    </motion.div>
    </>
  );
};
