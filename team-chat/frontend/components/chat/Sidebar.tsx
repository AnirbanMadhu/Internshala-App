'use client';

import React, { useState } from 'react';
import { Channel } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: () => void;
  onRefreshChannels: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  selectedChannelId,
  onChannelSelect,
  onCreateChannel,
  onRefreshChannels,
}) => {
  const { user, logout } = useAuth();
  const { onlineUsers, isConnected } = useSocket();
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold mb-2">Team Chat</h1>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{user?.username}</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase">
              Channels
            </h2>
            <button
              onClick={onCreateChannel}
              className="text-gray-400 hover:text-white text-xl leading-none"
              title="Create channel"
            >
              +
            </button>
          </div>

          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onChannelSelect(channel._id)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedChannelId === channel._id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{channel.isPrivate ? '🔒' : '#'}</span>
                  <span className="truncate">{channel.name}</span>
                </div>
              </button>
            ))}
          </div>

          {channels.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              No channels yet. Create one to get started!
            </p>
          )}
        </div>

        {/* Online Users */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-sm font-semibold text-gray-400 uppercase">
              Online ({onlineUsers.length})
            </h2>
            <span className="text-gray-400">
              {showOnlineUsers ? '▼' : '▶'}
            </span>
          </button>

          {showOnlineUsers && (
            <div className="space-y-2">
              {onlineUsers.map((onlineUser) => (
                <div
                  key={onlineUser.userId}
                  className="flex items-center text-sm text-gray-300"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <span className="truncate">{onlineUser.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refresh button */}
      <div className="p-4 border-t border-gray-700">
        <Button
          onClick={onRefreshChannels}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          Refresh Channels
        </Button>
      </div>
    </div>
  );
};
