import { ChatAction, User } from '@/contexts/ChatContext'

export class WebSocketService {
  private dispatch: React.Dispatch<ChatAction>
  private user: User
  private isConnected = true

  constructor(dispatch: React.Dispatch<ChatAction>, user: User) {
    this.dispatch = dispatch
    this.user = user
    // Simulate connection for Vercel API routes
    this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
  }

  // Simulate WebSocket methods for compatibility
  joinChannel(channelId: string) {
    console.log(`Joining channel ${channelId} via API`)
    // Channel joining is handled by the API routes
  }

  leaveChannel(channelId: string) {
    console.log(`Leaving channel ${channelId} via API`)
    // Channel leaving is handled by the API routes
  }

  sendMessage(channelId: string, content: string, type = 'text') {
    console.log(`Sending message to channel ${channelId}: ${content}`)
    // Message sending is handled by the API routes
  }

  startTyping(channelId: string) {
    console.log(`Started typing in channel ${channelId}`)
    // Typing indicators can be implemented with polling
  }

  stopTyping(channelId: string) {
    console.log(`Stopped typing in channel ${channelId}`)
    // Typing indicators can be implemented with polling
  }

  disconnect() {
    this.isConnected = false
    this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
  }

  getConnectionState(): number {
    return this.isConnected ? 1 : 3 // 1 = OPEN, 3 = CLOSED
  }

  isConnected(): boolean {
    return this.isConnected
  }
}