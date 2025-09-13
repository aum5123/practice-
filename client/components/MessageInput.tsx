'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'

export function MessageInput() {
  const { state, sendMessage, startTyping, stopTyping } = useChat()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !state.currentChannel) return

    const messageContent = message.trim()
    setMessage('')
    
    // Stop typing indicator
    if (isTyping) {
      stopTyping()
      setIsTyping(false)
    }

    // Send message
    await sendMessage(messageContent)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Start typing indicator
    if (!isTyping && state.currentChannel) {
      startTyping()
      setIsTyping(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        stopTyping()
        setIsTyping(false)
      }
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  if (!state.currentChannel) {
    return null
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${state.currentChannel.name}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={1}
            maxLength={2000}
            disabled={!state.isConnected}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {message.length}/2000
            </span>
            {!state.isConnected && (
              <span className="text-xs text-error-600">
                Disconnected - messages will be queued
              </span>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || !state.isConnected}
          className="btn btn-primary p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
