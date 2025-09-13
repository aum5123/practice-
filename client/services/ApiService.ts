import axios from 'axios'

const API_BASE_URL = '/api'

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

export class ApiService {
  private axiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get('/users')
    return response.data.data
  }

  async getUser(userId: string): Promise<User> {
    const response = await this.axiosInstance.get(`/users/${userId}`)
    return response.data.data
  }

  async getUserByUsername(username: string): Promise<User> {
    const response = await this.axiosInstance.get(`/users/username/${encodeURIComponent(username)}`)
    return response.data.data
  }

  async createUser(username: string): Promise<User> {
    const response = await this.axiosInstance.post('/users', { username })
    return response.data.data
  }

  async updateUserLastSeen(userId: string): Promise<void> {
    await this.axiosInstance.put(`/users/${userId}/last-seen`)
  }

  // Channel methods
  async getChannels(): Promise<Channel[]> {
    const response = await this.axiosInstance.get('/channels')
    return response.data.data
  }

  async getChannel(channelId: string): Promise<Channel> {
    const response = await this.axiosInstance.get(`/channels/${channelId}`)
    return response.data.data
  }

  async createChannel(name: string, createdBy: string): Promise<Channel> {
    const response = await this.axiosInstance.post('/channels', { name, createdBy })
    return response.data.data
  }

  async joinChannel(channelId: string, userId: string): Promise<void> {
    await this.axiosInstance.post(`/channels/${channelId}/join`, { userId })
  }

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    await this.axiosInstance.post(`/channels/${channelId}/leave`, { userId })
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    const response = await this.axiosInstance.get(`/channels/user/${userId}`)
    return response.data.data
  }

  // Message methods
  async getChannelMessages(channelId: string, limit?: number): Promise<Message[]> {
    const params = limit ? { limit } : {}
    const response = await this.axiosInstance.get(`/channels/${channelId}/messages`, { params })
    return response.data.data
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.axiosInstance.get('/health')
    return response.data
  }

  // Metrics
  async getMetrics(): Promise<any> {
    const response = await this.axiosInstance.get('/metrics')
    return response.data.data
  }
}
