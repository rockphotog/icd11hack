"""
ICD-11 API Client
Handles authentication and API calls to the ICD-11 service
"""

import httpx
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class ICD11Client:
    """Client for ICD-11 API interactions"""
    
    def __init__(self):
        self.base_url = os.getenv("ICD11_API_URL", "https://id.who.int/icd")
        self.client_id = os.getenv("ICD11_CLIENT_ID")
        self.client_secret = os.getenv("ICD11_CLIENT_SECRET")
        self.token_url = os.getenv("ICD11_TOKEN_URL", "https://icdaccessmanagement.who.int/connect/token")
        self.access_token: Optional[str] = None
        self.client = httpx.AsyncClient()
    
    async def get_access_token(self) -> str:
        """Obtain access token for ICD-11 API"""
        if not self.client_id or not self.client_secret:
            raise ValueError("ICD11 client credentials not configured")
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": "icdapi_access",
            "grant_type": "client_credentials"
        }
        
        response = await self.client.post(self.token_url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self.access_token = token_data["access_token"]
        return self.access_token
    
    async def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict[Any, Any]:
        """Make authenticated request to ICD-11 API"""
        if not self.access_token:
            await self.get_access_token()
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "API-Version": "v2",
            "Accept-Language": "en"
        }
        
        url = f"{self.base_url}/{endpoint}"
        response = await self.client.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()
    
    async def search_entities(self, query: str, use_flexisearch: bool = True) -> Dict[Any, Any]:
        """Search for ICD-11 entities"""
        endpoint = "entity/search"
        params = {
            "q": query,
            "flatResults": "false",
            "useFlexisearch": str(use_flexisearch).lower()
        }
        return await self._make_request(endpoint, params)
    
    async def get_entity(self, entity_id: str) -> Dict[Any, Any]:
        """Get specific ICD-11 entity by ID"""
        endpoint = f"entity/{entity_id}"
        return await self._make_request(endpoint)
    
    async def get_foundation_entities(self, language: str = "en") -> Dict[Any, Any]:
        """Get foundation entities from ICD-11"""
        endpoint = f"release/11/2023-01/mms/en"
        return await self._make_request(endpoint)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()