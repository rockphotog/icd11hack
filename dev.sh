#!/bin/bash

# Development runner script
# Runs both backend and frontend in development mode

echo "🚀 Starting development servers..."

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🐍 Starting Python backend..."
python app/main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend development server
echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📍 Frontend: http://localhost:9000"
echo "📍 Backend:  http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for servers to run
wait