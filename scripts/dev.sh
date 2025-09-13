#!/bin/bash

# Development script for Slack Clone
# This script helps set up and run the development environment

set -e

echo "🚀 Starting Slack Clone Development Environment"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start backend with Docker
echo "🐳 Starting backend server with Docker..."
docker-compose up -d --build

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Check if backend is responding
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend server is ready"
else
    echo "❌ Backend server is not responding. Check Docker logs:"
    docker-compose logs
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client
    npm install
    cd ..
fi

# Copy environment file if it doesn't exist
if [ ! -f "client/.env.local" ]; then
    echo "📝 Creating frontend environment file..."
    cp client/env.local.example client/.env.local
fi

# Start frontend
echo "🌐 Starting frontend development server..."
cd client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Development environment is ready!"
echo "=============================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "API:      http://localhost:3001/api"
echo "WebSocket: ws://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo '🛑 Stopping services...'; kill $FRONTEND_PID; docker-compose down; exit 0" INT

wait $FRONTEND_PID
