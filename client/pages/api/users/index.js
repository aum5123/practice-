// Users API endpoint
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return empty users array for now
    res.status(200).json({
      success: true,
      data: [],
      count: 0
    });
  } else if (req.method === 'POST') {
    // Create user
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
