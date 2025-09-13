# Deployment Guide

## Quick Start

### 1. Backend (Docker)
```bash
# Start backend server
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## Production Checklist

### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Replace in-memory store with Redis/PostgreSQL
- [ ] Implement proper authentication (JWT)

### Frontend
- [ ] Set production environment variables
- [ ] Configure custom domain
- [ ] Set up CDN for static assets
- [ ] Enable compression
- [ ] Configure security headers

### Infrastructure
- [ ] Set up load balancer
- [ ] Configure auto-scaling
- [ ] Set up backup strategy
- [ ] Monitor resource usage
- [ ] Set up alerting

## Environment Variables

### Backend Production
```env
PORT=3001
NODE_ENV=production
MAX_CHANNELS=1000
MAX_USERS=10000
MAX_MESSAGES_PER_CHANNEL=50
HEARTBEAT_INTERVAL=30000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Production
```env
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## Scaling Considerations

### Horizontal Scaling
- Use Redis for WebSocket scaling
- Implement sticky sessions
- Use message queues for high throughput
- Consider microservices architecture

### Database Migration
Replace in-memory store with:
- **Redis**: For caching and session storage
- **PostgreSQL**: For persistent data
- **MongoDB**: For document-based storage

### Monitoring
- Application metrics (Prometheus)
- Log aggregation (ELK stack)
- APM tools (DataDog, New Relic)
- Uptime monitoring
