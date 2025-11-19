#!/bin/bash

# ICD-11 Hackathon Test & Run Script
# Easy testing and running of the application locally

set -e  # Exit on any error

PROJECT_DIR="/Users/espen/git/icd11hack"
VENV_DIR="$PROJECT_DIR/venv"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ICD-11 Hackathon Test & Run Script${NC}"
echo "================================================"

cd "$PROJECT_DIR"

# Function to check if virtual environment exists
check_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
        python3 -m venv venv
        echo -e "${GREEN}✅ Virtual environment created${NC}"
    fi
}

# Function to install dependencies
install_deps() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    source venv/bin/activate
    
    # Install core Python dependencies
    pip install --quiet fastapi uvicorn python-dotenv httpx pytest pytest-asyncio
    
    # Install Node.js dependencies if needed
    if [ -f "package.json" ]; then
        npm install --silent
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Function to test environment variables
test_env() {
    echo -e "${BLUE}🔧 Testing environment variables...${NC}"
    source venv/bin/activate
    
    python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()

# Check required env vars
required_vars = ['ICD11_CLIENT_ID', 'ICD11_CLIENT_SECRET', 'ICD11_API_URL']
missing_vars = []

for var in required_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    print(f'❌ Missing environment variables: {missing_vars}')
    print('Please check your .env file')
    exit(1)
else:
    print('✅ All required environment variables are set')
"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Environment variables OK${NC}"
    else
        echo -e "${RED}❌ Environment variables missing${NC}"
        exit 1
    fi
}

# Function to test ICD-11 API connection
test_api() {
    echo -e "${BLUE}🌐 Testing ICD-11 API connection...${NC}"
    source venv/bin/activate
    
    python3 -c "
import asyncio
import sys
sys.path.append('.')
from app.api.icd11_client import ICD11Client

async def test():
    client = ICD11Client()
    try:
        await client.get_access_token()
        print('✅ ICD-11 API authentication successful')
        
        # Quick search test
        results = await client.search_entities('diabetes')
        count = len(results.get('destinationEntities', []))
        print(f'✅ API search test successful ({count} results)')
        return True
    except Exception as e:
        print(f'❌ API test failed: {e}')
        return False
    finally:
        await client.close()

success = asyncio.run(test())
exit(0 if success else 1)
"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ICD-11 API connection working${NC}"
    else
        echo -e "${RED}❌ ICD-11 API connection failed${NC}"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}🧪 Running tests...${NC}"
    source venv/bin/activate
    
    # Run Python tests
    python3 -m pytest tests/ -v --tb=short
    
    # Run Node.js tests if available
    if [ -f "package.json" ] && npm list jest >/dev/null 2>&1; then
        echo -e "${BLUE}Running JavaScript tests...${NC}"
        npm test
    fi
}

# Function to start the application
start_app() {
    echo -e "${BLUE}🌟 Starting ICD-11 Application...${NC}"
    
    # Check if ports are already in use
    if lsof -ti:8000 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 8000 is in use. Cleaning up...${NC}"
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    if lsof -ti:9000 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 9000 is in use. Cleaning up...${NC}"
        lsof -ti:9000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    echo -e "${YELLOW}Backend will start on: http://localhost:8000${NC}"
    echo -e "${YELLOW}Frontend will start on: http://localhost:9000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
    echo ""
    
    # Set PYTHONPATH and make dev.sh executable and run it
    export PYTHONPATH="$PROJECT_DIR"
    chmod +x dev.sh
    ./dev.sh
}

# Main script logic
case "${1:-help}" in
    "setup")
        echo -e "${BLUE}Setting up development environment...${NC}"
        check_venv
        install_deps
        test_env
        echo -e "${GREEN}🎉 Setup complete! Run './test-app.sh run' to start the application${NC}"
        ;;
    "test")
        echo -e "${BLUE}Running full test suite...${NC}"
        source venv/bin/activate
        test_env
        test_api
        run_tests
        echo -e "${GREEN}🎉 All tests completed!${NC}"
        ;;
    "api")
        echo -e "${BLUE}Testing API only...${NC}"
        source venv/bin/activate
        test_env
        test_api
        ;;
    "run")
        echo -e "${BLUE}Starting application...${NC}"
        source venv/bin/activate
        test_env
        start_app
        ;;
    "quick-run")
        echo -e "${BLUE}Quick start (skipping tests)...${NC}"
        source venv/bin/activate
        start_app
        ;;
    "help"|*)
        echo "Usage: ./test-app.sh [command]"
        echo ""
        echo "Commands:"
        echo "  setup      - Set up development environment and install dependencies"
        echo "  test       - Run full test suite (env, api, unit tests)"
        echo "  api        - Test API connection only"
        echo "  run        - Test environment and start application"
        echo "  quick-run  - Start application without running tests"
        echo "  help       - Show this help message"
        echo ""
        echo "If you get port conflicts (EADDRINUSE errors), run:"
        echo "  ./cleanup.sh   # Clean up stuck processes and free ports"
        echo ""
        echo "Examples:"
        echo "  ./test-app.sh setup     # First time setup"
        echo "  ./test-app.sh test      # Run all tests"
        echo "  ./test-app.sh run       # Start the application"
        echo "  ./cleanup.sh            # Fix port conflicts"
        ;;
esac