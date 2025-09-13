'use client'

import { useState } from 'react'
import { LogOut, Settings, Wifi, WifiOff, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'

interface HeaderProps {
  user: {
    id: string
    username: string
    lastSeen: string
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { state, dispatch } = useChat()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {user.username}
              </h1>
              <p className="text-xs text-gray-500">
                Last seen {formatLastSeen(user.lastSeen)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            {state.isConnected ? (
              <div className="flex items-center space-x-1 text-success-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-error-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs">Disconnected</span>
              </div>
            )}
          </div>

          {/* Online users count */}
          {state.currentChannel && (
            <div className="flex items-center space-x-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-xs">
                {state.currentChannel.memberCount} members
              </span>
            </div>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {state.error && (
        <div className="mt-2 p-3 bg-error-50 border border-error-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-error-700">{state.error}</p>
            <button
              onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
              className="text-error-500 hover:text-error-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
