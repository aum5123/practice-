const express = require('express');

const metricsRoutes = (dataStore, wsManager) => {
  const router = express.Router();

  // GET /api/metrics - Get application metrics
  router.get('/', (req, res) => {
    try {
      const dataStoreMetrics = dataStore.getMetrics();
      const wsMetrics = {
        activeConnections: wsManager.getActiveConnections()
      };

      const metrics = {
        ...dataStoreMetrics,
        ...wsMetrics,
        timestamp: new Date().toISOString(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        uptime: {
          seconds: Math.floor(process.uptime()),
          human: formatUptime(process.uptime())
        }
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics'
      });
    }
  });

  // GET /api/metrics/health - Get health check metrics
  router.get('/health', (req, res) => {
    try {
      const metrics = dataStore.getMetrics();
      const isHealthy = metrics.activeUsers > 0 || metrics.totalUsers > 0;

      res.json({
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'ok',
            websocket: wsManager.getActiveConnections() >= 0 ? 'ok' : 'error',
            memory: process.memoryUsage().heapUsed < 100 * 1024 * 1024 ? 'ok' : 'warning'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch health metrics'
      });
    }
  });

  // GET /api/metrics/channels/:id - Get channel-specific metrics
  router.get('/channels/:id', (req, res) => {
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
      const messages = dataStore.getChannelMessages(id);
      const activeConnections = wsManager.getChannelConnections(id);

      const channelMetrics = {
        channelId: id,
        channelName: channel.name,
        memberCount: members.length,
        messageCount: messages.length,
        activeConnections,
        createdAt: channel.createdAt,
        lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : channel.createdAt
      };

      res.json({
        success: true,
        data: channelMetrics
      });
    } catch (error) {
      console.error('Error fetching channel metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch channel metrics'
      });
    }
  });

  return router;
};

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

module.exports = { metricsRoutes };
