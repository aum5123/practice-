import { ChatAction, User, Message } from '@/contexts/ChatContext'

export class WebSocketService {
  private dispatch: React.Dispatch<ChatAction>
  private user: User
  private isConnected = true
  private currentChannelId: string | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private apiService: any

  constructor(dispatch: React.Dispatch<ChatAction>, user: User) {
    this.dispatch = dispatch
    this.user = user
    this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
    
    // Initialize API service for message sending
    this.apiService = {
      sendMessage: async (channelId: string, content: string, type: string) => {
        const response = await fetch(`/api/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.user.id,
            content,
            type
          })
        })
        return response.json()
      },
      getMessages: async (channelId: string) => {
        const response = await fetch(`/api/channels/${channelId}/messages`)
        return response.json()
      }
    }
  }

  joinChannel(channelId: string) {
    console.log(`Joining channel ${channelId} via API`)
    this.currentChannelId = channelId
    
    // Start polling for new messages
    this.startPolling()
  }

  leaveChannel(channelId: string) {
    console.log(`Leaving channel ${channelId} via API`)
    if (this.currentChannelId === channelId) {
      this.currentChannelId = null
      this.stopPolling()
    }
  }

  async sendMessage(channelId: string, content: string, type = 'text') {
    console.log(`Sending message to channel ${channelId}: ${content}`)
    try {
      const result = await this.apiService.sendMessage(channelId, content, type)
      if (result.success) {
        // Add message to local state immediately for better UX
        const message: Message = {
          id: result.data.id,
          channelId,
          userId: this.user.id,
          username: this.user.username,
          content,
          type,
          timestamp: result.data.timestamp
        }
        this.dispatch({ type: 'ADD_MESSAGE', payload: message })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  startTyping(channelId: string) {
    console.log(`Started typing in channel ${channelId}`)
    // Typing indicators can be implemented with polling
  }

  stopTyping(channelId: string) {
    console.log(`Stopped typing in channel ${channelId}`)
    // Typing indicators can be implemented with polling
  }

  private startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
    
    this.pollingInterval = setInterval(async () => {
      if (this.currentChannelId) {
        try {
          const result = await this.apiService.getMessages(this.currentChannelId)
          if (result.success) {
            this.dispatch({ type: 'SET_MESSAGES', payload: result.data })
          }
        } catch (error) {
          console.error('Failed to poll messages:', error)
        }
      }
    }, 2000) // Poll every 2 seconds
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  disconnect() {
    this.isConnected = false
    this.stopPolling()
    this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
  }

  getConnectionState(): number {
    return this.isConnected ? 1 : 3 // 1 = OPEN, 3 = CLOSED
  }

  getIsConnected(): boolean {
    return this.isConnected
  }
}