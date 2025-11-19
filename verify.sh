#!/bin/bash

# Environment Verification Script

echo "🔍 ICD-11 Hackathon Environment Verification"
echo "============================================="

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python 3: $(python3 --version)"
else
    echo "❌ Python 3 not found"
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
fi

# Check Docker (optional for OpenWebUI)
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
else
    echo "⚠️  Docker not found (optional - needed for OpenWebUI)"
fi

echo ""
echo "📁 Project Structure:"
echo "  Backend:  app/"
echo "  Frontend: static/"
echo "  Config:   config/"
echo "  Tests:    tests/"
echo "  OpenWebUI: openwebui/"

echo ""
echo "📋 Environment Files:"
if [ -f ".env" ]; then
    echo "  ✅ .env (configure your ICD-11 API credentials)"
else
    echo "  ⚠️  .env missing - copy from .env.example"
fi

if [ -f "requirements.txt" ]; then
    echo "  ✅ requirements.txt"
fi

if [ -f "package.json" ]; then
    echo "  ✅ package.json"
fi

echo ""
echo "🚀 Ready to Start:"
echo "  1. Configure ICD-11 API credentials in .env"
echo "  2. Run: ./dev.sh"
echo "  3. Open: http://localhost:9000"
echo ""
echo "🐳 For OpenWebUI:"
echo "  1. Run: ./openwebui/setup-openwebui.sh"
echo "  2. Open: http://localhost:3000"