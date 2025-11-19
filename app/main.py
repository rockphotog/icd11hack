#!/usr/bin/env python3
"""
ICD-11 Hackathon Application
Main entry point for the FastAPI application
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import os
from dotenv import load_dotenv

from .api.icd11_client import ICD11Client
from .routes import api_routes, web_routes

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ICD-11 Medical Terminology API",
    description="Application for ICD-11 medical terminology lookup and classification",
    version="1.0.0"
)

# CORS middleware for local development and GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routes
app.include_router(api_routes.router, prefix="/api")
app.include_router(web_routes.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "icd11-hackathon"}

# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main application page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>ICD-11 Medical Terminology</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/static/css/style.css">
    </head>
    <body>
        <div id="app">
            <h1>ICD-11 Medical Terminology Application</h1>
            <p>Loading application...</p>
        </div>
        <script src="/static/js/app.js"></script>
    </body>
    </html>
    """
    return html_content

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "localhost")
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug"
    )