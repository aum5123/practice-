// Channels API endpoint
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return empty channels array for now
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  } else if (req.method === 'POST') {
    // Create channel
    const { name, createdBy } = req.body;
    
    if (!name || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'Name and createdBy are required'
      });
    }

    const channel = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdBy,
      createdAt: new Date().toISOString(),
      memberCount: 0
    };

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
