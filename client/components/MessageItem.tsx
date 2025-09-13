'use client'

import { Message } from '@/contexts/ChatContext'

interface MessageItemProps {
  message: Message
  showAvatar: boolean
  isOwn: boolean
}

export function MessageItem({ message, showAvatar, isOwn }: MessageItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return 'Today'
    }
    
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    
    if (isYesterday) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString()
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-sm font-semibold">
                {message.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {showAvatar && isOwn && (
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {message.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Username and timestamp */}
          {showAvatar && (
            <div className={`flex items-center space-x-2 mb-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <span className="text-sm font-medium text-gray-900">
                {message.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div className={`message-bubble ${
            isOwn ? 'message-sent' : 'message-received'
          } ${!showAvatar ? 'mt-1' : ''}`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Timestamp for consecutive messages */}
          {!showAvatar && (
            <span className="text-xs text-gray-400 mt-1">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
