# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel account (free at vercel.com)
- Railway account (free at railway.app) or Render account
- Git repository (GitHub recommended)

## Step 1: Deploy Backend to Railway

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Slack Clone application"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/slack-clone.git
git push -u origin main
```

### 1.2 Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder as the root directory
6. Railway will automatically detect it's a Node.js app
7. Add environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   MAX_CHANNELS=1000
   MAX_USERS=10000
   MAX_MESSAGES_PER_CHANNEL=50
   HEARTBEAT_INTERVAL=30000
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
8. Deploy and get your backend URL (e.g., `https://your-app.railway.app`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Using Vercel CLI
```bash
cd client
vercel login
vercel
```

### 2.2 Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Set the root directory to `client`
6. Add environment variables:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
7. Deploy

## Step 3: Update CORS Settings

After getting your Vercel frontend URL, update your Railway backend:
1. Go to Railway dashboard
2. Update `CORS_ORIGIN` to your Vercel URL
3. Redeploy

## Alternative: Deploy Backend to Render

### 1. Create render.yaml
```yaml
services:
  - type: web
    name: slack-clone-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: CORS_ORIGIN
        value: https://your-frontend.vercel.app
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Create new Web Service
4. Select your repository
5. Set root directory to `server`
6. Deploy

## Environment Variables Summary

### Backend (Railway/Render)
```
PORT=3001
NODE_ENV=production
MAX_CHANNELS=1000
MAX_USERS=10000
MAX_MESSAGES_PER_CHANNEL=50
HEARTBEAT_INTERVAL=30000
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

## Testing Your Deployment

1. **Backend Health Check**: `https://your-backend.railway.app/api/health`
2. **Frontend**: `https://your-app.vercel.app`
3. **Test Features**:
   - Create users
   - Create channels
   - Send messages
   - Real-time updates

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update `CORS_ORIGIN` in backend
2. **WebSocket Issues**: Ensure using `wss://` for production
3. **Environment Variables**: Double-check all variables are set
4. **Build Errors**: Check Node.js version compatibility

### Debug Steps
1. Check Vercel function logs
2. Check Railway/Render logs
3. Test API endpoints directly
4. Verify environment variables

## Cost
- **Vercel**: Free tier (hobby plan)
- **Railway**: Free tier with usage limits
- **Render**: Free tier with usage limits

## Next Steps
- Set up custom domain
- Add monitoring (Sentry, LogRocket)
- Implement database (PostgreSQL, MongoDB)
- Add authentication (Auth0, Clerk)
- Set up CI/CD pipeline
