#!/bin/bash

# Development runner script
# Runs both backend and frontend in development mode

echo "🚀 Starting development servers..."

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    # Kill any remaining processes on our ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:9000 | xargs kill -9 2>/dev/null || true
    exit 0
}

# Set trap to handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
sleep 2

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start backend server
echo "🐍 Starting Python backend..."
cd /Users/espen/git/icd11hack
export PYTHONPATH=/Users/espen/git/icd11hack
python3 -m app.main &
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