'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Users, Zap, Shield } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Check if user exists, if not create one
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/username/${encodeURIComponent(username.trim())}`)
      
      let user
      if (response.ok) {
        const data = await response.json()
        user = data.data
      } else if (response.status === 404) {
        // User doesn't exist, create one
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username.trim() }),
        })

        if (!createResponse.ok) {
          throw new Error('Failed to create user')
        }

        const createData = await createResponse.json()
        user = createData.data
      } else {
        throw new Error('Failed to authenticate')
      }

      // Store user in localStorage and redirect to chat
      localStorage.setItem('user', JSON.stringify(user))
      router.push('/chat')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Slack Clone
          </h2>
          <p className="text-gray-600">
            Join the conversation with your team
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="Enter your username"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-error-600 text-sm bg-error-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2" />
                  Connecting...
                </div>
              ) : (
                'Join Chat'
              )}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-success-600" />
            </div>
            <p className="text-xs text-gray-600">Real-time</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-xs text-gray-600">Team Chat</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Secure</p>
          </div>
        </div>
      </div>
    </div>
  )
}
