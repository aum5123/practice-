const express = require('express');

const userRoutes = (dataStore) => {
  const router = express.Router();

  // GET /api/users - Get all users
  router.get('/', (req, res) => {
    try {
      const users = dataStore.getAllUsers();
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  });

  // POST /api/users - Create a new user
  router.post('/', (req, res) => {
    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Username is required and must be a non-empty string'
        });
      }

      const trimmedUsername = username.trim();

      // Check if username already exists
      const existingUser = dataStore.getUserByUsername(trimmedUsername);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
      }

      // Validate username length
      if (trimmedUsername.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Username must be 50 characters or less'
        });
      }

      const user = dataStore.createUser(trimmedUsername);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.message.includes('Maximum number of users')) {
        return res.status(507).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  });

  // GET /api/users/:id - Get user by ID
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const user = dataStore.getUser(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  });

  // GET /api/users/username/:username - Get user by username
  router.get('/username/:username', (req, res) => {
    try {
      const { username } = req.params;
      const user = dataStore.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user by username:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  });

  // PUT /api/users/:id/last-seen - Update user's last seen timestamp
  router.put('/:id/last-seen', (req, res) => {
    try {
      const { id } = req.params;
      const user = dataStore.getUser(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      dataStore.updateUserLastSeen(id);
      
      res.json({
        success: true,
        message: 'Last seen updated successfully'
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update last seen'
      });
    }
  });

  return router;
};

module.exports = { userRoutes };