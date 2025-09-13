# Slack Clone - Team Chat Application

A production-ready, real-time team chat application built with Node.js, WebSockets, and Next.js. Features channel-based messaging, real-time updates, and a modern UI similar to Slack.

## 🚀 Features

### Core Functionality
- **Real-time messaging** with WebSocket-based pub/sub
- **Channel-based conversations** with isolated message streams
- **User authentication** (simple username-based)
- **Channel management** (create, join, leave channels)
- **Message history** (last 20 messages per channel)
- **Typing indicators** for active users
- **Connection status** monitoring with automatic reconnection

### Technical Features
- **WebSocket heartbeats** for connection health monitoring
- **Concurrency-safe** operations with proper race condition handling
- **REST API** for user and channel management
- **In-memory data store** (easily replaceable with Redis/DB)
- **Docker containerization** for easy deployment
- **Metrics endpoint** for monitoring
- **Error handling** and logging throughout
- **Responsive design** with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Node.js       │    │   In-Memory     │
│   Frontend      │◄──►│   Backend       │◄──►│   Data Store    │
│   (React)       │    │   (Express)     │    │   (Map/Set)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │   WebSocket     │
         └──────────────►│   Server        │
                        │   (ws)          │
                        └─────────────────┘
```

## 📁 Project Structure

```
slack-clone/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── index.js        # Main server entry point
│   │   ├── dataStore.js    # In-memory data management
│   │   ├── websocketManager.js  # WebSocket handling
│   │   └── routes/         # REST API routes
│   │       ├── users.js    # User management
│   │       ├── channels.js # Channel management
│   │       └── metrics.js  # System metrics
│   ├── Dockerfile          # Docker configuration
│   └── package.json
├── client/                 # Frontend Next.js application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── services/          # API and WebSocket services
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** 18+ with Express.js
- **WebSocket** (ws library) for real-time communication
- **In-memory storage** (Map/Set) for data persistence
- **CORS** and **Helmet** for security
- **Morgan** for request logging

### Frontend
- **Next.js** 14 with React 18
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for HTTP requests

### DevOps
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Vercel** for frontend deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd slack-clone
```

### 2. Backend Setup (Docker)
```bash
# Start the backend server
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy environment file
cp env.local.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Access the Application
1. Open `http://localhost:3000` in your browser
2. Enter a username to create/login
3. Create or join channels
4. Start chatting!

## 🔧 Configuration

### Environment Variables

#### Backend (server/env.example)
```env
PORT=3001
NODE_ENV=development
MAX_CHANNELS=100
MAX_USERS=1000
MAX_MESSAGES_PER_CHANNEL=20
HEARTBEAT_INTERVAL=30000
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (client/env.local.example)
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production Configuration
For production deployment, update the environment variables:
- Set `NODE_ENV=production`
- Update `CORS_ORIGIN` to your frontend domain
- Update `NEXT_PUBLIC_WS_URL` and `NEXT_PUBLIC_API_URL` to your backend domain

## 📡 API Endpoints

### REST API (Backend)

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/username/:username` - Get user by username

#### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create a new channel
- `GET /api/channels/:id` - Get channel by ID
- `GET /api/channels/:id/messages` - Get channel messages
- `POST /api/channels/:id/join` - Join a channel
- `POST /api/channels/:id/leave` - Leave a channel

#### System
- `GET /api/health` - Health check
- `GET /api/metrics` - System metrics

### WebSocket Events

#### Client → Server
- `authenticate` - Authenticate user
- `join_channel` - Join a channel
- `leave_channel` - Leave a channel
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `ping` - Heartbeat ping

#### Server → Client
- `authenticated` - Authentication confirmed
- `channel_joined` - Channel joined with messages
- `channel_left` - Channel left confirmation
- `receive_message` - New message received
- `user_joined` - User joined channel
- `user_left` - User left channel
- `user_typing_start` - User started typing
- `user_typing_stop` - User stopped typing
- `pong` - Heartbeat response
- `error` - Error message

## 🚀 Deployment

### Backend Deployment (Docker)
```bash
# Build and run with Docker Compose
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Frontend Deployment (Vercel)

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy from client directory
   cd client
   vercel
   ```

2. **Environment Variables**
   Set these in Vercel dashboard:
   - `NEXT_PUBLIC_WS_URL` - Your WebSocket server URL
   - `NEXT_PUBLIC_API_URL` - Your API server URL

3. **Custom Domain** (Optional)
   Configure your custom domain in Vercel dashboard

### Production Considerations

1. **Database**: Replace in-memory store with Redis or PostgreSQL
2. **Authentication**: Implement JWT or OAuth
3. **Scaling**: Use Redis for WebSocket scaling
4. **Monitoring**: Add APM tools (DataDog, New Relic)
5. **CDN**: Use CloudFlare for static assets
6. **SSL**: Ensure HTTPS/WSS for production

## 📊 Monitoring

### Metrics Endpoint
Access `http://localhost:3001/api/metrics` for:
- Total users and active connections
- Channel count and message count
- Memory usage and uptime
- WebSocket connection status

### Health Check
Access `http://localhost:3001/api/health` for:
- Service health status
- Database connectivity
- WebSocket status
- Memory health

## 🧪 Testing

### Manual Testing
1. **Multiple Users**: Open multiple browser tabs/windows
2. **Real-time Updates**: Send messages and verify instant delivery
3. **Channel Isolation**: Messages should only appear in correct channels
4. **Connection Recovery**: Test network disconnection/reconnection
5. **Typing Indicators**: Verify typing status updates

### Load Testing
Use tools like Artillery or k6 to test:
- Concurrent user connections
- Message throughput
- Memory usage under load
- WebSocket connection limits

## 🔒 Security Considerations

### Current Implementation
- CORS protection
- Input validation
- Rate limiting (basic)
- XSS protection via React

### Production Recommendations
- JWT authentication
- Rate limiting per user/IP
- Input sanitization
- CSRF protection
- Content Security Policy
- WebSocket authentication
- Message encryption

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend is running
   - Verify WebSocket URL in environment variables
   - Check CORS configuration

2. **Messages Not Appearing**
   - Verify user is in the channel
   - Check WebSocket connection status
   - Look for errors in browser console

3. **Docker Issues**
   - Ensure Docker is running
   - Check port availability (3001)
   - Review Docker logs: `docker-compose logs`

4. **Frontend Build Issues**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in backend environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by Slack's user experience
- Uses industry best practices for real-time applications

---

**Happy Chatting! 🎉**
