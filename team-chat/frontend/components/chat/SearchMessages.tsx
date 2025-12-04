'use client';

import React, { useState } from 'react';
import { Message } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    } catch (err: any) {
      setError(err.message || 'Failed to search messages');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Search Messages</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3">
          {results.length > 0 ? (
            results.map((message) => (
              <div
                key={message._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800">{message.username}</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-gray-700">{message.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {query && !loading ? 'No messages found' : 'Enter a search term to find messages'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
