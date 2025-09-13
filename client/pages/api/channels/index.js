import { db } from '../../../lib/database';

// Channels API endpoint
export default function handler(req, res) {
  if (req.method === 'GET') {
    const channels = db.getAllChannels();
    res.status(200).json({
      success: true,
      data: channels,
      count: channels.length
    });
  } else if (req.method === 'POST') {
    const { name, createdBy } = req.body;
    
    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'Name and createdBy are required'
      });
    }

    // Check if channel already exists
    const existingChannel = db.getAllChannels().find(c => c.name === name);
    if (existingChannel) {
      return res.status(409).json({
        success: false,
        error: 'Channel name already exists'
      });
    }

    const channel = db.createChannel({ name, createdBy });

    res.status(201).json({
      success: true,
      data: channel,
      message: 'Channel created successfully'
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
