# Quick Start with test-app.sh

The `test-app.sh` script provides easy local testing and running of the ICD-11 application.

## First Time Setup
```bash
./test-app.sh setup
```
This will:
- Create virtual environment if needed
- Install Python and Node.js dependencies
- Test environment variables

## Running the Application
```bash
./test-app.sh run
```
This will:
- Test environment and API connection
- Start both backend (port 8000) and frontend (port 9000) servers

## Testing Only
```bash
./test-app.sh test    # Full test suite
./test-app.sh api     # API connection only
```

## Quick Start (Skip Tests)
```bash
./test-app.sh quick-run
```

## Available Commands
- `setup` - Set up development environment
- `test` - Run full test suite 
- `api` - Test API connection only
- `run` - Test environment and start application
- `quick-run` - Start application without tests
- `help` - Show help message

The script handles virtual environment activation automatically and provides colored output for easy debugging.