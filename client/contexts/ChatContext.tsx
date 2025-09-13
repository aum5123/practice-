'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { WebSocketService } from '@/services/WebSocketService'
import { ApiService } from '@/services/ApiService'

// Types
export interface User {
  id: string
  username: string
  createdAt: string
  lastSeen: string
}

export interface Channel {
  id: string
  name: string
  createdBy: string
  createdAt: string
  memberCount: number
}

export interface Message {
  id: string
  channelId: string
  userId: string
  username: string
  content: string
  type: string
  timestamp: string
}

export interface TypingUser {
  id: string
  username: string
  channelId: string
}

// State interface
interface ChatState {
  user: User | null
  channels: Channel[]
  currentChannel: Channel | null
  messages: Message[]
  typingUsers: TypingUser[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

// Action types
export type ChatAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CHANNELS'; payload: Channel[] }
  | { type: 'SET_CURRENT_CHANNEL'; payload: Channel | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING_USERS'; payload: TypingUser[] }
  | { type: 'ADD_TYPING_USER'; payload: TypingUser }
  | { type: 'REMOVE_TYPING_USER'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }

// Initial state
const initialState: ChatState = {
  user: null,
  channels: [],
  currentChannel: null,
  messages: [],
  typingUsers: [],
  isConnected: false,
  isLoading: false,
  error: null,
}

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload }
    case 'SET_CURRENT_CHANNEL':
      return { ...state, currentChannel: action.payload }
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload }
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.some(u => u.id === action.payload.id)
          ? state.typingUsers
          : [...state.typingUsers, action.payload]
      }
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.id !== action.payload)
      }
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

// Context
interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  wsService: WebSocketService | null
  apiService: ApiService
  joinChannel: (channelId: string) => Promise<void>
  leaveChannel: (channelId: string) => Promise<void>
  sendMessage: (content: string, type?: string) => Promise<void>
  startTyping: () => void
  stopTyping: () => void
  createChannel: (name: string) => Promise<void>
  loadChannels: () => Promise<void>
  loadMessages: (channelId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider component
interface ChatProviderProps {
  children: React.ReactNode
  user: User
}

export function ChatProvider({ children, user }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, { ...initialState, user })
  const wsServiceRef = useRef<WebSocketService | null>(null)
  const apiService = useRef(new ApiService()).current

  // Initialize WebSocket connection
  useEffect(() => {
    if (user) {
      const wsService = new WebSocketService(dispatch, user)
      wsServiceRef.current = wsService

      return () => {
        wsService.disconnect()
      }
    }
  }, [user])

  // Load initial data
  useEffect(() => {
    if (user) {
      loadChannels()
    }
  }, [user])

  // WebSocket service getter
  const wsService = wsServiceRef.current

  // Actions
  const joinChannel = async (channelId: string) => {
    if (!wsService || !state.user) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Join via WebSocket
      wsService.joinChannel(channelId)

      // Load messages
      await loadMessages(channelId)

      // Update current channel
      const channel = state.channels.find(c => c.id === channelId)
      if (channel) {
        dispatch({ type: 'SET_CURRENT_CHANNEL', payload: channel })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to join channel' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const leaveChannel = async (channelId: string) => {
    if (!wsService || !state.user) return

    try {
      wsService.leaveChannel(channelId)

      // If leaving current channel, clear it
      if (state.currentChannel?.id === channelId) {
        dispatch({ type: 'SET_CURRENT_CHANNEL', payload: null })
        dispatch({ type: 'SET_MESSAGES', payload: [] })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to leave channel' })
    }
  }

  const sendMessage = async (content: string, type = 'text') => {
    if (!wsService || !state.currentChannel || !state.user) return

    try {
      wsService.sendMessage(state.currentChannel.id, content, type)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to send message' })
    }
  }

  const startTyping = () => {
    if (!wsService || !state.currentChannel) return
    wsService.startTyping(state.currentChannel.id)
  }

  const stopTyping = () => {
    if (!wsService || !state.currentChannel) return
    wsService.stopTyping(state.currentChannel.id)
  }

  const createChannel = async (name: string) => {
    if (!state.user) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const channel = await apiService.createChannel(name, state.user.id)
      dispatch({ type: 'SET_CHANNELS', payload: [...state.channels, channel] })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create channel' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadChannels = async () => {
    try {
      const channels = await apiService.getChannels()
      dispatch({ type: 'SET_CHANNELS', payload: channels })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load channels' })
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const messages = await apiService.getChannelMessages(channelId)
      dispatch({ type: 'SET_MESSAGES', payload: messages })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load messages' })
    }
  }

  const contextValue: ChatContextType = {
    state,
    dispatch,
    wsService,
    apiService,
    joinChannel,
    leaveChannel,
    sendMessage,
    startTyping,
    stopTyping,
    createChannel,
    loadChannels,
    loadMessages,
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use the context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
