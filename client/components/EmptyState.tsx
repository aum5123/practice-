'use client'

import { MessageSquare, Hash, Users } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="h-8 w-8 text-primary-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to your workspace
        </h3>
        
        <p className="text-gray-600 mb-8">
          Select a channel from the sidebar to start chatting with your team, or create a new channel to get started.
        </p>
        
        <div className="grid grid-cols-1 gap-4 text-left">
          <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Hash className="h-4 w-4 text-primary-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Join a channel</h4>
              <p className="text-sm text-gray-600">
                Browse existing channels and join conversations that interest you.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-success-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Create a channel</h4>
              <p className="text-sm text-gray-600">
                Start a new conversation by creating a channel for your team or project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
