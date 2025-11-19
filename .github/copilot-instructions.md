# ICD-11 Hackathon Project - AI Coding Instructions

## Architecture Overview

This is a **hybrid Python/Node.js medical terminology application** with FastAPI backend (`app/`) and vanilla JavaScript frontend (`static/`), designed for ICD-11 medical code lookup and OpenWebUI integration.

### Key Components & Boundaries

- **Backend**: FastAPI app in `app/main.py` serves both API endpoints (`/api/*`) and static files
- **API Client**: `app/api/icd11_client.py` handles WHO ICD-11 API authentication via OAuth2 client credentials
- **Frontend**: Vanilla JS in `static/js/app.js` with server-side rendered HTML from FastAPI root endpoint
- **OpenWebUI Integration**: Docker containerization via `openwebui/setup-openwebui.sh` for medical chatbot interfaces

## Critical Development Workflows

### Starting Development
```bash
./dev.sh  # Runs both Python backend (port 8000) and Node.js dev server (port 9000)
```

### Testing Strategy
```bash
# Backend tests use pytest with async FastAPI client
python -m pytest tests/ -v

# Frontend tests use Jest with test fixtures
npm test
```

### Environment Setup
- **Required**: ICD-11 API credentials in `.env` (see `.env.example`)
- **Python**: 3.11+ with FastAPI/uvicorn stack
- **Node**: 18+ for frontend build pipeline and dev server

## Project-Specific Patterns

### API Authentication Pattern
```python
# app/api/icd11_client.py uses singleton client pattern
class ICD11Client:
    async def get_access_token(self):  # OAuth2 client credentials flow
    async def _make_request(self, endpoint: str):  # Auto-retry with token refresh
```

### Frontend Integration
- FastAPI serves HTML directly from root endpoint (no separate index.html)
- Static assets mounted at `/static` route
- Frontend makes AJAX calls to `/api/*` endpoints on same origin

### OpenWebUI Integration
- Medical chatbot configuration in `config/openwebui.json`
- Docker setup script automatically mounts configuration and connects to local API
- Designed for healthcare-specific chat interfaces

## Key Files for Understanding

- `app/main.py`: FastAPI app setup, CORS config, route mounting
- `app/api/icd11_client.py`: WHO API integration patterns
- `dev.sh`: Dual-server development setup
- `static/js/app.js`: Frontend medical search UI patterns
- `.github/workflows/deploy.yml`: GitHub Pages deployment with both Python/Node builds

## External Dependencies & Integration Points

- **WHO ICD-11 API**: OAuth2 authentication, medical terminology endpoints
- **OpenWebUI**: Docker container integration for medical chatbots
- **GitHub Pages**: Static deployment target (frontend only)
- **FastAPI auto-docs**: Available at `/docs` for API exploration

## Common Debugging Notes

- Backend runs on port 8000, frontend dev server on 9000
- Check `.env` file for missing ICD-11 credentials if API calls fail
- OpenWebUI requires Docker Desktop for local development
- GitHub Actions deploys static frontend only (backend for local dev)