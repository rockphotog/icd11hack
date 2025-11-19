"""Web route handlers for serving static content and pages"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/docs", response_class=HTMLResponse)
async def documentation():
    """Serve documentation page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>ICD-11 API Documentation</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/static/css/style.css">
    </head>
    <body>
        <div class="container">
            <h1>ICD-11 Medical Terminology API</h1>
            <h2>Available Endpoints</h2>
            
            <div class="endpoint">
                <h3>GET /api/search</h3>
                <p>Search for ICD-11 entities</p>
                <ul>
                    <li><strong>q</strong> (required): Search query</li>
                    <li><strong>flexisearch</strong> (optional): Use flexible search (default: true)</li>
                </ul>
            </div>
            
            <div class="endpoint">
                <h3>GET /api/entity/{entity_id}</h3>
                <p>Get specific ICD-11 entity by ID</p>
            </div>
            
            <div class="endpoint">
                <h3>GET /api/foundation</h3>
                <p>Get foundation entities</p>
                <ul>
                    <li><strong>language</strong> (optional): Language code (default: en)</li>
                </ul>
            </div>
            
            <p><a href="/health">Health Check</a></p>
            <p><a href="/">Back to Main Application</a></p>
        </div>
    </body>
    </html>
    """
    return html_content