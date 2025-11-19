# Development Guide

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd icd11hackaton
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your ICD-11 API credentials
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Node.js dependencies**
   ```bash
   npm install
   ```

5. **Run the development servers**
   
   Backend (Python/FastAPI):
   ```bash
   python app/main.py
   ```
   
   Frontend (Webpack dev server):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:9000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Project Structure

```
icd11hackaton/
├── app/                    # Python backend application
│   ├── __init__.py
│   ├── main.py            # FastAPI application entry point
│   ├── api/               # API-related modules
│   │   ├── __init__.py
│   │   └── icd11_client.py # ICD-11 API client
│   └── routes/            # Route handlers
│       ├── __init__.py
│       ├── api_routes.py  # API endpoints
│       └── web_routes.py  # Web page routes
├── static/                # Static frontend assets
│   ├── css/
│   │   └── style.css     # Application styles
│   ├── js/
│   │   └── app.js        # Frontend JavaScript
│   └── index.html        # Main HTML template
├── tests/                 # Test files
├── config/               # Configuration files
├── .github/              # GitHub Actions workflows
└── docs/                 # Documentation
```

### API Endpoints

#### Search
- **GET** `/api/search?q={query}&flexisearch={boolean}`
  - Search ICD-11 entities
  - Parameters:
    - `q`: Search query (required)
    - `flexisearch`: Enable flexible search (optional, default: true)

#### Entity Details
- **GET** `/api/entity/{entity_id}`
  - Get specific ICD-11 entity by ID

#### Foundation Entities
- **GET** `/api/foundation?language={lang}`
  - Get foundation entities
  - Parameters:
    - `language`: Language code (optional, default: en)

### Testing

Run Python tests:
```bash
python -m pytest tests/ -v
```

Run JavaScript tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

### Code Quality

Format Python code:
```bash
black app/
```

Lint Python code:
```bash
flake8 app/
```

Type checking:
```bash
mypy app/
```

### Building for Production

Build static assets:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### ICD-11 API Configuration

To use the ICD-11 API, you need to register at the WHO Developer Portal and obtain your API credentials:

1. Visit https://icd.who.int/icdapi
2. Register for an account
3. Create a new application
4. Copy your client ID and secret to the `.env` file:
   ```
   ICD11_CLIENT_ID=your_client_id
   ICD11_CLIENT_SECRET=your_client_secret
   ```

### OpenWebUI Integration

This project is designed to work with OpenWebUI for enhanced medical terminology interfaces. The integration points include:

- Configuration in `config/openwebui.json`
- Frontend components that can be embedded in OpenWebUI
- API endpoints compatible with OpenWebUI's medical plugins

### Deployment

The application supports deployment to GitHub Pages via GitHub Actions. The workflow automatically:

1. Runs tests
2. Builds static assets
3. Deploys to GitHub Pages

To enable GitHub Pages deployment:

1. Go to repository Settings → Pages
2. Select "GitHub Actions" as the source
3. Push to the main branch to trigger deployment

### Troubleshooting

**Common Issues:**

1. **Import errors in Python**
   - Make sure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python version: `python --version` (should be 3.11+)

2. **Node.js build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be 18+)

3. **ICD-11 API authentication errors**
   - Verify your credentials in the `.env` file
   - Check that your API application is active in the WHO Developer Portal
   - Ensure the API URL is correct

4. **CORS errors in development**
   - The backend is configured to allow CORS for local development
   - If using different ports, update the CORS configuration in `app/main.py`

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### License

This project is licensed under the MIT License.