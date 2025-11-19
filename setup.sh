#!/bin/bash

# ICD-11 Hackathon Application Startup Script

echo "🚀 Starting ICD-11 Hackathon Application..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "✅ Python and Node.js detected"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please configure your ICD-11 API credentials in .env file"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "🎯 Setup complete!"
echo ""
echo "To start the application:"
echo "  Backend:  python app/main.py"
echo "  Frontend: npm run dev"
echo ""
echo "Then visit:"
echo "  Frontend: http://localhost:9000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"