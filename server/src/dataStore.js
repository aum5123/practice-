const { v4: uuidv4 } = require('uuid');

class DataStore {
  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.channelMembers = new Map(); // channelId -> Set of userIds
    this.channelMessages = new Map(); // channelId -> Array of messages
    this.userSessions = new Map(); // userId -> Set of WebSocket connections
    
    // Configuration
    this.maxChannels = parseInt(process.env.MAX_CHANNELS) || 100;
    this.maxUsers = parseInt(process.env.MAX_USERS) || 1000;
    this.maxMessagesPerChannel = parseInt(process.env.MAX_MESSAGES_PER_CHANNEL) || 20;
  }

  // User management
  createUser(username) {
    if (this.users.size >= this.maxUsers) {
      throw new Error('Maximum number of users reached');
    }

    const userId = uuidv4();
    const user = {
      id: userId,
      username,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    this.users.set(userId, user);
    this.userSessions.set(userId, new Set());
    
    console.log(`User created: ${username} (${userId})`);
    return user;
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  updateUserLastSeen(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeen = new Date().toISOString();
    }
  }

  // Channel management
  createChannel(name, createdBy) {
    if (this.channels.size >= this.maxChannels) {
      throw new Error('Maximum number of channels reached');
    }

    const channelId = uuidv4();
    const channel = {
      id: channelId,
      name,
      createdBy,
      createdAt: new Date().toISOString(),
      memberCount: 0
    };

    this.channels.set(channelId, channel);
    this.channelMembers.set(channelId, new Set());
    this.channelMessages.set(channelId, []);
    
    console.log(`Channel created: ${name} (${channelId}) by ${createdBy}`);
    return channel;
  }

  getChannel(channelId) {
    return this.channels.get(channelId);
  }

  getAllChannels() {
    return Array.from(this.channels.values()).map(channel => ({
      ...channel,
      memberCount: this.channelMembers.get(channel.id)?.size || 0
    }));
  }

  // Channel membership
  addUserToChannel(userId, channelId) {
    const channel = this.channels.get(channelId);
    const user = this.users.get(userId);
    
    if (!channel || !user) {
      throw new Error('Channel or user not found');
    }

    const members = this.channelMembers.get(channelId);
    if (!members.has(userId)) {
      members.add(userId);
      channel.memberCount = members.size;
      console.log(`User ${user.username} joined channel ${channel.name}`);
    }
  }

  removeUserFromChannel(userId, channelId) {
    const members = this.channelMembers.get(channelId);
    if (members) {
      members.delete(userId);
      const channel = this.channels.get(channelId);
      if (channel) {
        channel.memberCount = members.size;
      }
    }
  }

  getChannelMembers(channelId) {
    const members = this.channelMembers.get(channelId);
    if (!members) return [];
    
    return Array.from(members).map(userId => this.users.get(userId)).filter(Boolean);
  }

  getUserChannels(userId) {
    const userChannels = [];
    for (const [channelId, members] of this.channelMembers.entries()) {
      if (members.has(userId)) {
        const channel = this.channels.get(channelId);
        if (channel) {
          userChannels.push({
            ...channel,
            memberCount: members.size
          });
        }
      }
    }
    return userChannels;
  }

  // Message management
  addMessage(channelId, userId, content, type = 'text') {
    const channel = this.channels.get(channelId);
    const user = this.users.get(userId);
    
    if (!channel || !user) {
      throw new Error('Channel or user not found');
    }

    const message = {
      id: uuidv4(),
      channelId,
      userId,
      username: user.username,
      content,
      type,
      timestamp: new Date().toISOString()
    };

    const messages = this.channelMessages.get(channelId);
    messages.push(message);

    // Keep only the last N messages
    if (messages.length > this.maxMessagesPerChannel) {
      messages.splice(0, messages.length - this.maxMessagesPerChannel);
    }

    console.log(`Message added to ${channel.name}: ${user.username}: ${content}`);
    return message;
  }

  getChannelMessages(channelId, limit = null) {
    const messages = this.channelMessages.get(channelId) || [];
    return limit ? messages.slice(-limit) : messages;
  }

  // WebSocket session management
  addUserSession(userId, ws) {
    const sessions = this.userSessions.get(userId);
    if (sessions) {
      sessions.add(ws);
    }
  }

  removeUserSession(userId, ws) {
    const sessions = this.userSessions.get(userId);
    if (sessions) {
      sessions.delete(ws);
    }
  }

  getUserSessions(userId) {
    return this.userSessions.get(userId) || new Set();
  }

  // Metrics
  getMetrics() {
    const activeUsers = Array.from(this.userSessions.values())
      .reduce((count, sessions) => count + sessions.size, 0);
    
    const totalMessages = Array.from(this.channelMessages.values())
      .reduce((count, messages) => count + messages.length, 0);

    return {
      totalUsers: this.users.size,
      activeUsers,
      totalChannels: this.channels.size,
      totalMessages,
      uptime: process.uptime()
    };
  }

  // Cleanup
  cleanup() {
    this.users.clear();
    this.channels.clear();
    this.channelMembers.clear();
    this.channelMessages.clear();
    this.userSessions.clear();
  }
}

module.exports = { DataStore };