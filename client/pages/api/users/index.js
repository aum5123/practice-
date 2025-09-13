import { db } from '../../../lib/database';

// Users API endpoint
export default function handler(req, res) {
  if (req.method === 'GET') {
    const users = db.getAllUsers();
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } else if (req.method === 'POST') {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    // Check if user already exists
    const existingUser = db.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    const user = db.createUser({ username });

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
