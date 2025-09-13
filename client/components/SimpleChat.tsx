'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { EmptyState } from './EmptyState'

export function SimpleChat() {
  const { state } = useChat()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Simulate real-time messaging with polling
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, you'd fetch new messages from the API
      // For now, we'll just keep the existing messages
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !state.currentChannel) return

    const message = {
      id: Math.random().toString(36).substr(2, 9),
      channelId: state.currentChannel.id,
      userId: state.user?.id,
      username: state.user?.username,
      content: content.trim(),
      type: 'text',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm">Start the conversation in #{state.currentChannel.name}</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null
            const showAvatar = !prevMessage || prevMessage.userId !== message.userId
            
            return (
              <div key={message.id} className={`flex ${message.userId === state.user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${message.userId === state.user?.id ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                  {showAvatar && (
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.userId === state.user?.id ? 'bg-primary-600' : 'bg-primary-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          message.userId === state.user?.id ? 'text-white' : 'text-primary-600'
                        }`}>
                          {message.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${message.userId === state.user?.id ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <div className={`flex items-center space-x-2 mb-1 ${message.userId === state.user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span className="text-sm font-medium text-gray-900">
                          {message.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    <div className={`message-bubble ${
                      message.userId === state.user?.id ? 'message-sent' : 'message-received'
                    } ${!showAvatar ? 'mt-1' : ''}`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${state.currentChannel.name}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              maxLength={2000}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
