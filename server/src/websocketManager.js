const { v4: uuidv4 } = require('uuid');

class WebSocketManager {
  constructor(wss, dataStore) {
    this.wss = wss;
    this.dataStore = dataStore;
    this.heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL) || 30000;
    this.connections = new Map(); // ws -> { userId, lastPing }
    
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      // Initialize connection
      this.connections.set(ws, {
        userId: null,
        lastPing: Date.now(),
        channels: new Set()
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle connection close
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection(ws);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'welcome',
        message: 'Connected to chat server'
      });
    });
  }

  handleMessage(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection) return;

    switch (message.type) {
      case 'authenticate':
        this.handleAuthenticate(ws, message);
        break;
      case 'join_channel':
        this.handleJoinChannel(ws, message);
        break;
      case 'leave_channel':
        this.handleLeaveChannel(ws, message);
        break;
      case 'send_message':
        this.handleSendMessage(ws, message);
        break;
      case 'typing_start':
        this.handleTypingStart(ws, message);
        break;
      case 'typing_stop':
        this.handleTypingStop(ws, message);
        break;
      case 'ping':
        this.handlePing(ws, message);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  handleAuthenticate(ws, message) {
    const { userId } = message;
    const user = this.dataStore.getUser(userId);
    
    if (!user) {
      this.sendError(ws, 'Invalid user ID');
      return;
    }

    const connection = this.connections.get(ws);
    connection.userId = userId;
    connection.lastPing = Date.now();

    // Add to user sessions
    this.dataStore.addUserSession(userId, ws);

    this.sendMessage(ws, {
      type: 'authenticated',
      user: user
    });

    console.log(`User ${user.username} authenticated via WebSocket`);
  }

  handleJoinChannel(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection.userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    const { channelId } = message;
    const channel = this.dataStore.getChannel(channelId);
    
    if (!channel) {
      this.sendError(ws, 'Channel not found');
      return;
    }

    try {
      // Add user to channel
      this.dataStore.addUserToChannel(connection.userId, channelId);
      connection.channels.add(channelId);

      // Send recent messages
      const messages = this.dataStore.getChannelMessages(channelId);
      
      this.sendMessage(ws, {
        type: 'channel_joined',
        channel: channel,
        messages: messages
      });

      // Notify other users in the channel
      this.broadcastToChannel(channelId, {
        type: 'user_joined',
        user: this.dataStore.getUser(connection.userId),
        channel: channel
      }, connection.userId);

      console.log(`User ${connection.userId} joined channel ${channel.name}`);
    } catch (error) {
      this.sendError(ws, error.message);
    }
  }

  handleLeaveChannel(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection.userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    const { channelId } = message;
    const channel = this.dataStore.getChannel(channelId);
    
    if (!channel) {
      this.sendError(ws, 'Channel not found');
      return;
    }

    // Remove user from channel
    this.dataStore.removeUserFromChannel(connection.userId, channelId);
    connection.channels.delete(channelId);

    this.sendMessage(ws, {
      type: 'channel_left',
      channelId: channelId
    });

    // Notify other users in the channel
    this.broadcastToChannel(channelId, {
      type: 'user_left',
      user: this.dataStore.getUser(connection.userId),
      channel: channel
    }, connection.userId);

    console.log(`User ${connection.userId} left channel ${channel.name}`);
  }

  handleSendMessage(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection.userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    const { channelId, content, type = 'text' } = message;
    const channel = this.dataStore.getChannel(channelId);
    
    if (!channel) {
      this.sendError(ws, 'Channel not found');
      return;
    }

    // Check if user is in the channel
    if (!connection.channels.has(channelId)) {
      this.sendError(ws, 'Not a member of this channel');
      return;
    }

    try {
      // Add message to store
      const messageObj = this.dataStore.addMessage(channelId, connection.userId, content, type);
      
      // Broadcast to all users in the channel
      this.broadcastToChannel(channelId, {
        type: 'receive_message',
        message: messageObj
      });

      console.log(`Message broadcasted in ${channel.name}: ${messageObj.username}: ${content}`);
    } catch (error) {
      this.sendError(ws, error.message);
    }
  }

  handleTypingStart(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection.userId) {
      return;
    }

    const { channelId } = message;
    const user = this.dataStore.getUser(connection.userId);
    
    if (user && connection.channels.has(channelId)) {
      this.broadcastToChannel(channelId, {
        type: 'user_typing_start',
        user: user,
        channelId: channelId
      }, connection.userId);
    }
  }

  handleTypingStop(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection.userId) {
      return;
    }

    const { channelId } = message;
    const user = this.dataStore.getUser(connection.userId);
    
    if (user && connection.channels.has(channelId)) {
      this.broadcastToChannel(channelId, {
        type: 'user_typing_stop',
        user: user,
        channelId: channelId
      }, connection.userId);
    }
  }

  handlePing(ws, message) {
    const connection = this.connections.get(ws);
    if (connection) {
      connection.lastPing = Date.now();
    }
    this.sendMessage(ws, { type: 'pong' });
  }

  handleDisconnection(ws) {
    const connection = this.connections.get(ws);
    if (!connection) return;

    if (connection.userId) {
      // Remove from all channels
      for (const channelId of connection.channels) {
        this.dataStore.removeUserFromChannel(connection.userId, channelId);
        
        // Notify other users
        this.broadcastToChannel(channelId, {
          type: 'user_left',
          user: this.dataStore.getUser(connection.userId),
          channelId: channelId
        }, connection.userId);
      }

      // Remove from user sessions
      this.dataStore.removeUserSession(connection.userId, ws);
    }

    this.connections.delete(ws);
    console.log('WebSocket connection closed');
  }

  broadcastToChannel(channelId, message, excludeUserId = null) {
    const members = this.dataStore.getChannelMembers(channelId);
    
    for (const user of members) {
      if (excludeUserId && user.id === excludeUserId) continue;
      
      const sessions = this.dataStore.getUserSessions(user.id);
      for (const ws of sessions) {
        if (ws.readyState === ws.OPEN) {
          this.sendMessage(ws, message);
        }
      }
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  sendError(ws, error) {
    this.sendMessage(ws, {
      type: 'error',
      error: error
    });
  }

  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      const timeout = this.heartbeatInterval * 2;

      for (const [ws, connection] of this.connections.entries()) {
        if (now - connection.lastPing > timeout) {
          console.log('Closing inactive connection');
          ws.terminate();
        } else {
          // Send ping
          this.sendMessage(ws, { type: 'ping' });
        }
      }
    }, this.heartbeatInterval);
  }

  getActiveConnections() {
    return this.connections.size;
  }

  getChannelConnections(channelId) {
    const members = this.dataStore.getChannelMembers(channelId);
    let count = 0;
    
    for (const user of members) {
      const sessions = this.dataStore.getUserSessions(user.id);
      count += sessions.size;
    }
    
    return count;
  }
}

module.exports = { WebSocketManager };