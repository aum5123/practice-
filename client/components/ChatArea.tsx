'use client'

import { useChat } from '@/contexts/ChatContext'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { EmptyState } from './EmptyState'

export function ChatArea() {
  const { state } = useChat()

  if (!state.currentChannel) {
    return <EmptyState />
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 text-sm font-semibold">#</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {state.currentChannel.name}
            </h2>
            <p className="text-sm text-gray-500">
              {state.currentChannel.memberCount} members
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList />
        <MessageInput />
      </div>
    </div>
  )
}
