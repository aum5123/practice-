const express = require('express');

const channelRoutes = (dataStore, wsManager) => {
  const router = express.Router();

  // GET /api/channels - Get all channels
  router.get('/', (req, res) => {
    try {
      const channels = dataStore.getAllChannels();
      res.json({
        success: true,
        data: channels,
        count: channels.length
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch channels'
      });
    }
  });

  // POST /api/channels - Create a new channel
  router.post('/', (req, res) => {
    try {
      const { name, createdBy } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Channel name is required and must be a non-empty string'
        });
      }

      if (!createdBy || typeof createdBy !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'CreatedBy user ID is required'
        });
      }

      const trimmedName = name.trim();

      // Validate channel name length
      if (trimmedName.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Channel name must be 100 characters or less'
        });
      }

      // Check if user exists
      const user = dataStore.getUser(createdBy);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if channel name already exists
      const existingChannels = dataStore.getAllChannels();
      const nameExists = existingChannels.some(channel => 
        channel.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (nameExists) {
        return res.status(409).json({
          success: false,
          error: 'Channel name already exists'
        });
      }

      const channel = dataStore.createChannel(trimmedName, createdBy);
      
      res.status(201).json({
        success: true,
        data: channel,
        message: 'Channel created successfully'
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      
      if (error.message.includes('Maximum number of channels')) {
        return res.status(507).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create channel'
      });
    }
  });

  // GET /api/channels/:id - Get channel by ID
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const channel = dataStore.getChannel(id);

      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found'
        });
      }

      const members = dataStore.getChannelMembers(id);
      const channelWithMembers = {
        ...channel,
        members: members
      };

      res.json({
        success: true,
        data: channelWithMembers
      });
    } catch (error) {
      console.error('Error fetching channel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch channel'
      });
    }
  });

  // GET /api/channels/:id/messages - Get channel messages
  router.get('/:id/messages', (req, res) => {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const channel = dataStore.getChannel(id);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found'
        });
      }

      const limitNum = limit ? parseInt(limit) : null;
      const messages = dataStore.getChannelMessages(id, limitNum);

      res.json({
        success: true,
        data: messages,
        count: messages.length
      });
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch channel messages'
      });
    }
  });

  // POST /api/channels/:id/join - Join a channel
  router.post('/:id/join', (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const channel = dataStore.getChannel(id);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found'
        });
      }

      const user = dataStore.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is already in the channel
      const members = dataStore.getChannelMembers(id);
      if (members.some(member => member.id === userId)) {
        return res.status(409).json({
          success: false,
          error: 'User is already a member of this channel'
        });
      }

      dataStore.addUserToChannel(userId, id);

      res.json({
        success: true,
        message: 'Successfully joined channel',
        data: {
          channel: channel,
          user: user
        }
      });
    } catch (error) {
      console.error('Error joining channel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join channel'
      });
    }
  });

  // POST /api/channels/:id/leave - Leave a channel
  router.post('/:id/leave', (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const channel = dataStore.getChannel(id);
      if (!channel) {
        return res.status(404).json({
          success: false,
          error: 'Channel not found'
        });
      }

      const user = dataStore.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      dataStore.removeUserFromChannel(userId, id);

      res.json({
        success: true,
        message: 'Successfully left channel'
      });
    } catch (error) {
      console.error('Error leaving channel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to leave channel'
      });
    }
  });

  // GET /api/channels/user/:userId - Get user's channels
  router.get('/user/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const user = dataStore.getUser(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userChannels = dataStore.getUserChannels(userId);

      res.json({
        success: true,
        data: userChannels,
        count: userChannels.length
      });
    } catch (error) {
      console.error('Error fetching user channels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user channels'
      });
    }
  });

  return router;
};

module.exports = { channelRoutes };
