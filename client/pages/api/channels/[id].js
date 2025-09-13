// Get channel by ID
export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // For now, return a mock channel
    const channel = {
      id: id,
      name: 'channel' + id,
      createdBy: 'user123',
      createdAt: new Date().toISOString(),
      memberCount: 1
    };

    res.status(200).json({
      success: true,
      data: channel
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
