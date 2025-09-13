'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatProvider } from '@/contexts/ChatContext'
import { Sidebar } from '@/components/Sidebar'
import { SimpleChat } from '@/components/SimpleChat'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/')
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('user')
      router.push('/')
      return
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <ChatProvider user={user}>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header user={user} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <SimpleChat />
        </div>
      </div>
    </ChatProvider>
  )
}
