const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { DataStore } = require('./dataStore');
const { WebSocketManager } = require('./websocketManager');
const { userRoutes } = require('./routes/users');
const { channelRoutes } = require('./routes/channels');
const { metricsRoutes } = require('./routes/metrics');

const app = express();
const server = http.createServer(app);

// Configuration
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Initialize data store
const dataStore = new DataStore();

// Initialize WebSocket manager
const wss = new WebSocket.Server({ server });
const wsManager = new WebSocketManager(wss, dataStore);

// Routes
app.use('/api/users', userRoutes(dataStore));
app.use('/api/channels', channelRoutes(dataStore, wsManager));
app.use('/api/metrics', metricsRoutes(dataStore, wsManager));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for connections`);
  console.log(`🌍 CORS enabled for: ${CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});