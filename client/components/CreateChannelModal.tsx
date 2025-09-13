'use client'

import { useState, useEffect } from 'react'
import { X, Hash } from 'lucide-react'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChannel: (name: string) => Promise<void>
  isLoading: boolean
}

export function CreateChannelModal({ isOpen, onClose, onCreateChannel, isLoading }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setChannelName('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!channelName.trim()) {
      setError('Channel name is required')
      return
    }

    if (channelName.trim().length > 100) {
      setError('Channel name must be 100 characters or less')
      return
    }

    try {
      await onCreateChannel(channelName.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create channel')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Create a new channel
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-2">
                Channel name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="channelName"
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="e.g. general, random, project-alpha"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Channel names must be lowercase, without spaces or special characters.
              </p>
            </div>

            {error && (
              <div className="text-error-600 text-sm bg-error-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !channelName.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2" />
                    Creating...
                  </div>
                ) : (
                  'Create Channel'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
