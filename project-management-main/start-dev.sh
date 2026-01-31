#!/bin/bash

# Start both frontend and backend servers for development

echo "🚀 Starting Project Management Application..."
echo ""

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env not found. Please create it with your database credentials."
    echo "   See server/.env.example for reference."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update VITE_API_URL and VITE_CLERK_PUBLISHABLE_KEY"
    fi
fi

# Start backend in background
echo "📦 Starting backend server..."
cd server
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

