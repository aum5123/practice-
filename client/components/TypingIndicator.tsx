'use client'

import { TypingUser } from '@/contexts/ChatContext'

interface TypingIndicatorProps {
  users: TypingUser[]
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`
    } else {
      return `${users.length} people are typing`
    }
  }

  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
      <div className="typing-dots">
        <div className="typing-dot" style={{ animationDelay: '0ms' }} />
        <div className="typing-dot" style={{ animationDelay: '150ms' }} />
        <div className="typing-dot" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}
