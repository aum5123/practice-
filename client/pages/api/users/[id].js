// Get user by ID
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // For now, return a mock user
    const user = {
      id: id,
      username: 'user' + id,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: user
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
