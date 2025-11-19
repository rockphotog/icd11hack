"""
Test cases for main application endpoints
"""

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "icd11-hackathon"


def test_root_endpoint(client):
    """Test root endpoint returns HTML"""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "ICD-11 Medical Terminology" in response.text


def test_docs_endpoint(client):
    """Test documentation endpoint"""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "API Documentation" in response.text