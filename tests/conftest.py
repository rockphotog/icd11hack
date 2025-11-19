"""
Test configuration and utilities
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)

@pytest.fixture
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()