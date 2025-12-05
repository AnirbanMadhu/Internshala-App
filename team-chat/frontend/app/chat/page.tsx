'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import { Channel, Message } from '@/types';
import { Sidebar } from '@/components/chat/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { CreateChannelModal } from '@/components/chat/CreateChannelModal';
import { SearchMessages } from '@/components/chat/SearchMessages';
import { ChannelMembers } from '@/components/chat/ChannelMembers';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatPage() {
  const { user, loading: authLoading, token } = useAuth();
  const { socket, typingUsers } = useSocket();
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch all accessible channels
  const fetchChannels = async () => {
    try {
      const response = await fetch(`${API_URL}/api/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setChannels(data.channels);

        // Auto-select first channel if none selected
        if (!selectedChannelId && data.channels.length > 0) {
          setSelectedChannelId(data.channels[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // Fetch messages for a specific channel with pagination
  const fetchMessages = async (channelId: string, pageNum: number = 1) => {
    if (!channelId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/messages?channelId=${channelId}&page=${pageNum}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (response.ok) {
        // First page replaces messages, subsequent pages prepend
        if (pageNum === 1) {
          setMessages(data.messages);
        } else {
          setMessages((prev) => [...data.messages, ...prev]);
        }

        setHasMore(data.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial channels
  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [user]);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannelId) {
      setMessages([]);
      setPage(1);
      fetchMessages(selectedChannelId, 1);

      // Join socket room for this channel
      if (socket) {
        socket.emit('channel:join', selectedChannelId);
      }

      return () => {
        // Leave socket room when changing channels
        if (socket && selectedChannelId) {
          socket.emit('channel:leave', selectedChannelId);
        }
      };
    }
  }, [selectedChannelId, socket]);

  // Socket.io event handlers for messages
  useEffect(() => {
    if (!socket || !selectedChannelId) return;

    const handleNewMessage = (message: Message) => {
      if (message.channelId === selectedChannelId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageEdited = (message: Message) => {
      if (message.channelId === selectedChannelId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? message : m))
        );
      }
    };

    const handleMessageDeleted = (data: { messageId: string; channelId: string }) => {
      if (data.channelId === selectedChannelId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? { ...m, content: '[Message deleted]', deleted: true }
              : m
          )
        );
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleMessageEdited);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleMessageEdited);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, selectedChannelId]);

  // Socket.io event handler for channel updates (independent of selected channel)
  useEffect(() => {
    if (!socket) return;

    const handleMemberAdded = (data: { channelId: string; channel: Channel }) => {
      // Update the channels list with the new member info
      setChannels((prev) =>
        prev.map((ch) =>
          ch._id === data.channelId ? data.channel : ch
        )
      );
    };

    socket.on('channel:member-added', handleMemberAdded);

    return () => {
      socket.off('channel:member-added', handleMemberAdded);
    };
  }, [socket]);

  // Send a new message to the current channel
  const handleSendMessage = async (content: string, file?: File) => {
    if (!selectedChannelId) return;

    try {
      const formData = new FormData();
      formData.append('channelId', selectedChannelId);
      formData.append('content', content);

      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Emit message to other users via Socket.io
        if (socket) {
          socket.emit('message:send', data.message);
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  // Create a new channel
  const handleCreateChannel = async (
    name: string,
    description: string,
    isPrivate: boolean
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, isPrivate }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchChannels();
        setSelectedChannelId(data.channel._id);
        toast.success(`Channel "${name}" created successfully!`);
      } else {
        throw new Error(data.error || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
      toast.error('Failed to create channel');
      throw error;
    }
  };

  // Edit an existing message
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: newContent }),
      });

      const data = await response.json();

      if (response.ok) {
        if (socket) {
          socket.emit('message:edit', data.message);
        }
        toast.success('Message updated successfully');
      } else {
        throw new Error(data.error || 'Failed to edit message');
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast.error('Failed to edit message');
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok && socket) {
        socket.emit('message:delete', {
          messageId,
          channelId: selectedChannelId,
        });
        toast.success('Message deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Load more messages (pagination)
  const handleLoadMore = () => {
    if (selectedChannelId && !loading && hasMore) {
      fetchMessages(selectedChannelId, page + 1);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedChannel = channels.find((c) => c._id === selectedChannelId);
  const channelTypingUsers = typingUsers
    .filter((t) => t.channelId === selectedChannelId && t.userId !== user._id)
    .map((t) => t.username);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        channels={channels}
        selectedChannelId={selectedChannelId}
        onChannelSelect={setSelectedChannelId}
        onCreateChannel={() => setShowCreateModal(true)}
        onRefreshChannels={fetchChannels}
      />

      <div className="flex-1 flex">
        {selectedChannel ? (
          <>
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Channel Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm"
              >
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedChannel.isPrivate ? '🔒' : '#'}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {selectedChannel.name}
                    </span>
                  </h2>
                  {selectedChannel.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedChannel.description}</p>
                  )}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span className="font-medium">Search</span>
                </motion.button>
              </motion.div>

              {/* Messages */}
              <MessageList
                messages={messages}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loading}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />

              {/* Message Input */}
              {selectedChannelId && (
                <MessageInput
                  channelId={selectedChannelId}
                  onSendMessage={handleSendMessage}
                  typingUsers={channelTypingUsers}
                />
              )}
            </div>

            {/* Channel Members Sidebar */}
            <ChannelMembers channel={selectedChannel} />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
          >
            <div className="text-center max-w-md px-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <span className="text-5xl">💬</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Welcome to Team Chat!
                </h2>
                <p className="text-gray-600 text-lg">
                  Select a channel or create a new one to start chatting with your team
                </p>
              </motion.div>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-2xl shadow-blue-500/50 transition-all"
              >
                Create Your First Channel
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateChannel={handleCreateChannel}
      />

      {selectedChannelId && (
        <SearchMessages
          channelId={selectedChannelId}
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
}
