#!/bin/bash

# OpenWebUI Setup and Integration Script

echo "🔧 Setting up OpenWebUI for ICD-11 Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required for OpenWebUI but not installed."
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker detected"

# Create OpenWebUI data directory
mkdir -p openwebui_data

# Check if OpenWebUI container already exists
if [ "$(docker ps -aq -f name=open-webui)" ]; then
    echo "🔄 OpenWebUI container already exists. Stopping and removing..."
    docker stop open-webui 2>/dev/null
    docker rm open-webui 2>/dev/null
fi

# Pull and run OpenWebUI
echo "📦 Pulling and starting OpenWebUI container..."
docker run -d \
    --name open-webui \
    -p 3000:8080 \
    -v $(pwd)/openwebui_data:/app/backend/data \
    -v $(pwd)/config:/app/config \
    --restart unless-stopped \
    ghcr.io/open-webui/open-webui:main

# Wait for container to start
echo "⏳ Waiting for OpenWebUI to start..."
sleep 10

# Check if container is running
if [ "$(docker ps -q -f name=open-webui)" ]; then
    echo "✅ OpenWebUI is running!"
    echo ""
    echo "🌐 Access OpenWebUI at: http://localhost:3000"
    echo "📋 Configuration files are in: ./config/"
    echo "💾 Data is stored in: ./openwebui_data/"
    echo ""
    echo "🔗 To integrate with your ICD-11 app:"
    echo "   1. Make sure your backend is running on http://localhost:8000"
    echo "   2. Configure API endpoints in OpenWebUI settings"
    echo "   3. Use the medical terminology search features"
    echo ""
    echo "To stop OpenWebUI: docker stop open-webui"
    echo "To view logs: docker logs -f open-webui"
else
    echo "❌ Failed to start OpenWebUI container"
    echo "Check Docker logs: docker logs open-webui"
    exit 1
fi