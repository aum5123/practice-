'use client'

import { useState, useEffect } from 'react'
import { X, Hash, Users, Search } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'

interface JoinChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onJoinChannel: (channelId: string) => void
  isLoading: boolean
}

export function JoinChannelModal({ isOpen, onClose, onJoinChannel, isLoading }: JoinChannelModalProps) {
  const { state, loadChannels } = useChat()
  const [searchTerm, setSearchTerm] = useState('')
  const [availableChannels, setAvailableChannels] = useState(state.channels)

  useEffect(() => {
    if (isOpen) {
      loadChannels()
    }
  }, [isOpen, loadChannels])

  useEffect(() => {
    setAvailableChannels(state.channels)
  }, [state.channels])

  const filteredChannels = availableChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleJoinChannel = (channelId: string) => {
    onJoinChannel(channelId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Join Channel</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="spinner mx-auto mb-2" />
              Loading channels...
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Hash className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                {searchTerm ? 'No channels found' : 'No channels available'}
              </p>
              <p className="text-xs text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Create a channel to get started'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleJoinChannel(channel.id)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Hash className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {channel.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{channel.memberCount} members</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-primary-600 font-medium">
                      Join
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
