# ICD-11 Hackathon Project

A Python application with offline web UI for medical terminology using the ICD-11 code system, featuring OpenWebUI integration for enhanced medical interfaces.

## 🚀 Quick Start

### Automated Setup
```bash
./setup.sh
```

### Manual Setup

1. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Configure API credentials:**

   ```bash
   cp .env.example .env
   # Edit .env with your ICD-11 API credentials
   ```

4. **Run the application:**

   ```bash
   ./dev.sh
   ```

   Or manually:
   ```bash
   # Backend
   python app/main.py

   # Frontend (in another terminal)
   npm run dev
   ```

## 🌐 Access Points

- **Frontend:** http://localhost:9000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **OpenWebUI:** http://localhost:3000 (after running `./openwebui/setup-openwebui.sh`)

## 📁 Project Structure

```
icd11hackaton/
├── app/                    # Python FastAPI backend
│   ├── main.py            # Application entry point
│   ├── api/               # ICD-11 API client
│   └── routes/            # API and web routes
├── static/                # Frontend assets (HTML, CSS, JS)
├── openwebui/             # OpenWebUI integration scripts
├── config/                # Configuration files
├── tests/                 # Test files
├── .github/               # GitHub Actions workflows
├── setup.sh               # Automated setup script
└── dev.sh                 # Development server runner
```

## 🔧 Features

- **ICD-11 Integration:** Search and browse medical terminology
- **OpenWebUI Ready:** Designed for medical chatbot interfaces
- **Offline Capable:** Works without internet for cached data
- **GitHub Actions:** Automated deployment to GitHub Pages
- **Responsive Design:** Works on desktop and mobile
- **API Documentation:** Auto-generated with FastAPI
- **Medical Focus:** Optimized for healthcare applications

## 🔑 ICD-11 API Setup

1. Register at [WHO ICD-11 API](https://icd.who.int/icdapi)
2. Create an application and get credentials
3. Add to `.env` file:
   ```env
   ICD11_CLIENT_ID=your_client_id
   ICD11_CLIENT_SECRET=your_client_secret
   ```

## 🐳 OpenWebUI Integration

Run OpenWebUI with medical configuration:
```bash
./openwebui/setup-openwebui.sh
```

This will:
- Start OpenWebUI container on port 3000
- Mount medical configuration
- Connect to your ICD-11 backend API

## 🧪 Testing

```bash
# Python tests
python -m pytest tests/ -v

# JavaScript tests
npm test

# All tests with coverage
npm run test:coverage
```

## 📦 Deployment

### GitHub Pages (Automatic)
- Push to `main` branch
- GitHub Actions will deploy automatically
- Static version available at your GitHub Pages URL

### Manual Build
```bash
npm run build
```

## 🛠️ Development

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development instructions.

## 📋 Requirements

- **Python:** 3.11+ 
- **Node.js:** 18+
- **Docker:** For OpenWebUI (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.