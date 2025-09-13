import { ChatAction, User, Channel, Message, TypingUser } from '@/contexts/ChatContext'

export class WebSocketService {
  private dispatch: React.Dispatch<ChatAction>
  private user: User
  private isConnected = true

  constructor(dispatch: React.Dispatch<ChatAction>, user: User) {
    this.dispatch = dispatch
    this.user = user
    // No WebSocket connection needed for Vercel API routes
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
        this.authenticate()
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.isConnecting = false
        this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
        this.stopHeartbeat()
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
        this.dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      this.isConnecting = false
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.dispatch({ type: 'SET_ERROR', payload: 'Connection lost. Please refresh the page.' })
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private authenticate() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'authenticate',
        userId: this.user.id
      })
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'authenticated':
        console.log('WebSocket authenticated')
        break

      case 'channel_joined':
        this.dispatch({ type: 'SET_MESSAGES', payload: message.messages || [] })
        break

      case 'channel_left':
        // Channel left confirmation
        break

      case 'receive_message':
        this.dispatch({ type: 'ADD_MESSAGE', payload: message.message })
        break

      case 'user_joined':
        // Handle user joined notification
        break

      case 'user_left':
        // Handle user left notification
        break

      case 'user_typing_start':
        this.dispatch({ 
          type: 'ADD_TYPING_USER', 
          payload: {
            id: message.user.id,
            username: message.user.username,
            channelId: message.channelId
          }
        })
        break

      case 'user_typing_stop':
        this.dispatch({ 
          type: 'REMOVE_TYPING_USER', 
          payload: message.user.id 
        })
        break

      case 'pong':
        // Heartbeat response
        break

      case 'error':
        console.error('WebSocket error:', message.error)
        this.dispatch({ type: 'SET_ERROR', payload: message.error })
        break

      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  // Public methods
  joinChannel(channelId: string) {
    this.send({
      type: 'join_channel',
      channelId
    })
  }

  leaveChannel(channelId: string) {
    this.send({
      type: 'leave_channel',
      channelId
    })
  }

  sendMessage(channelId: string, content: string, type = 'text') {
    this.send({
      type: 'send_message',
      channelId,
      content,
      type
    })
  }

  startTyping(channelId: string) {
    this.send({
      type: 'typing_start',
      channelId
    })
  }

  stopTyping(channelId: string) {
    this.send({
      type: 'typing_stop',
      channelId
    })
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED
  }

  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false
  }
}
