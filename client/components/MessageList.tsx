'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { MessageItem } from './MessageItem'
import { TypingIndicator } from './TypingIndicator'

export function MessageList() {
  const { state } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.messages])

  // Auto-scroll to bottom when typing users change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.typingUsers])

  if (!state.currentChannel) {
    return null
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
    >
      {state.messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-sm">Start the conversation in #{state.currentChannel.name}</p>
          </div>
        </div>
      ) : (
        <>
          {state.messages.map((message, index) => {
            const prevMessage = index > 0 ? state.messages[index - 1] : null
            const showAvatar = !prevMessage || prevMessage.userId !== message.userId
            
            return (
              <MessageItem
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                isOwn={message.userId === state.user?.id}
              />
            )
          })}
          
          {/* Typing indicator */}
          {state.typingUsers.length > 0 && (
            <TypingIndicator users={state.typingUsers} />
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
