// WebSocket endpoint for Vercel
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, return a simple response
  // In production, you'd need a WebSocket service like Pusher or Socket.io
  res.status(200).json({
    message: 'WebSocket endpoint - use a WebSocket service for real-time features',
    suggestion: 'Consider using Pusher, Socket.io, or Ably for WebSocket functionality'
  });
}
