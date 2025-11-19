#!/bin/bash

# Cleanup script for ICD-11 application
# Kills all related processes and frees up ports

echo "🧹 Cleaning up ICD-11 application processes..."

# Kill processes by name patterns
echo "Killing Python processes..."
pkill -f "python.*app.main" 2>/dev/null || true

echo "Killing Node.js/http-server processes..."
pkill -f "http-server" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

echo "Killing dev.sh and test-app.sh processes..."
pkill -f "dev.sh" 2>/dev/null || true
pkill -f "test-app.sh" 2>/dev/null || true

# Kill processes using our specific ports
echo "Freeing up ports 8000 and 9000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:9000 | xargs kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Check if ports are now free
if ! lsof -ti:8000 >/dev/null 2>&1 && ! lsof -ti:9000 >/dev/null 2>&1; then
    echo "✅ Cleanup successful! Ports 8000 and 9000 are now free."
else
    echo "⚠️  Some processes may still be running. Check manually with:"
    echo "   lsof -i:8000"
    echo "   lsof -i:9000"
fi

echo "🎉 Cleanup complete!"