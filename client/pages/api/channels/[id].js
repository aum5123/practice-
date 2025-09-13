import { db } from '../../../lib/database'

// Get channel by ID
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const channel = db.getChannel(id);
      
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: 'Channel not found'
        });
      }

      res.status(200).json({
        success: true,
        data: channel
      });
    } catch (error) {
      console.error('Error fetching channel:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
