// Get channel messages
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // For now, return empty messages array
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  } else if (req.method === 'POST') {
    // Create a new message
    const { content, userId, username } = req.body;

    if (!content || !userId || !username) {
      return res.status(400).json({
        success: false,
        error: 'Content, userId, and username are required'
      });
    }

    const message = {
      id: Math.random().toString(36).substr(2, 9),
      channelId: id,
      userId,
      username,
      content,
      type: 'text',
      timestamp: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message created successfully'
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
