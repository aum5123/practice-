// Simple in-memory database for Vercel API routes
// Note: This data will be lost when the serverless function restarts

let users = [];
let channels = [];
let messages = [];

export const db = {
  // Users
  createUser: (userData) => {
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    users.push(user);
    return user;
  },

  getUser: (id) => {
    return users.find(user => user.id === id);
  },

  getUserByUsername: (username) => {
    return users.find(user => user.username === username);
  },

  getAllUsers: () => {
    return users;
  },

  // Channels
  createChannel: (channelData) => {
    const channel = {
      id: Math.random().toString(36).substr(2, 9),
      ...channelData,
      createdAt: new Date().toISOString(),
      memberCount: 0
    };
    channels.push(channel);
    return channel;
  },

  getChannel: (id) => {
    return channels.find(channel => channel.id === id);
  },

  getAllChannels: () => {
    return channels;
  },

  // Messages
  createMessage: (messageData) => {
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      ...messageData,
      timestamp: new Date().toISOString()
    };
    messages.push(message);
    return message;
  },

  getChannelMessages: (channelId) => {
    return messages.filter(message => message.channelId === channelId);
  },

  getAllMessages: () => {
    return messages;
  }
};
