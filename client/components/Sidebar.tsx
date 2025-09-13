'use client'

import { useState } from 'react'
import { Plus, Hash, Users, MessageSquare } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { CreateChannelModal } from './CreateChannelModal'

export function Sidebar() {
  const { state, joinChannel, createChannel } = useChat()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleChannelSelect = (channelId: string) => {
    if (state.currentChannel?.id !== channelId) {
      joinChannel(channelId)
    }
  }

  const handleCreateChannel = async (name: string) => {
    await createChannel(name)
    setShowCreateModal(false)
  }

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Channels</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Create Channel"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {state.isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="spinner mx-auto mb-2" />
              Loading channels...
            </div>
          ) : state.channels.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No channels yet</p>
              <p className="text-xs text-gray-400">Create one to get started</p>
            </div>
          ) : (
            <div className="p-2">
              {state.channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    state.currentChannel?.id === channel.id
                      ? 'bg-primary-100 text-primary-900 border border-primary-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Hash className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {channel.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{channel.memberCount} members</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <div className={`w-2 h-2 rounded-full ${
                state.isConnected ? 'bg-success-500' : 'bg-error-500'
              }`} />
            </div>
            <div className="mt-1">
              {state.isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateChannel={handleCreateChannel}
        isLoading={state.isLoading}
      />
    </>
  )
}
