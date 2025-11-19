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
    
    async def search_entities(self, query: str, use_flexisearch: bool = True, language: str = "en") -> Dict[Any, Any]:
        """Search for ICD-11 entities with language support"""
        endpoint = "entity/search"
        params = {
            "q": query,
            "flatResults": "false",
            "useFlexisearch": str(use_flexisearch).lower()
        }
        
        # Update headers for specific language
        headers = {
            "Authorization": f"Bearer {self.access_token or await self.get_access_token()}",
            "Accept": "application/json",
            "API-Version": "v2",
            "Accept-Language": language
        }
        
        url = f"{self.base_url}/{endpoint}"
        response = await self.client.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()

    async def get_entity_details(self, entity_id: str, language: str = "en", include_children: bool = False) -> Dict[Any, Any]:
        """Get detailed information about a specific ICD-11 entity"""
        endpoint = f"entity/{entity_id}"
        
        headers = {
            "Authorization": f"Bearer {self.access_token or await self.get_access_token()}",
            "Accept": "application/json",
            "API-Version": "v2",
            "Accept-Language": language
        }
        
        url = f"{self.base_url}/{endpoint}"
        response = await self.client.get(url, headers=headers)
        response.raise_for_status()
        
        entity_data = response.json()
        
        # If requested, get children entities
        if include_children and 'child' in entity_data:
            children_data = []
            for child_url in entity_data.get('child', []):
                child_id = child_url.split('/')[-1]
                try:
                    child_data = await self.get_entity(child_id)
                    children_data.append(child_data)
                except:
                    continue
            entity_data['children_details'] = children_data
        
        return entity_data

    async def get_entity_hierarchy(self, entity_id: str, language: str = "en") -> Dict[Any, Any]:
        """Get hierarchy information for an entity (parents and children)"""
        entity = await self.get_entity_details(entity_id, language)
        
        hierarchy = {
            "current": entity,
            "parents": [],
            "children": [],
            "siblings": []
        }
        
        # Get parent information
        if 'parent' in entity:
            for parent_url in entity.get('parent', []):
                parent_id = parent_url.split('/')[-1]
                try:
                    parent_data = await self.get_entity(parent_id)
                    hierarchy['parents'].append(parent_data)
                except:
                    continue
        
        # Get children information
        if 'child' in entity:
            for child_url in entity.get('child', []):
                child_id = child_url.split('/')[-1]
                try:
                    child_data = await self.get_entity(child_id)
                    hierarchy['children'].append(child_data)
                except:
                    continue
        
        return hierarchy
    
    async def get_entity(self, entity_id: str) -> Dict[Any, Any]:
        """Get specific ICD-11 entity by ID (legacy method)"""
        return await self.get_entity_details(entity_id)

    async def get_supported_languages(self) -> Dict[Any, Any]:
        """Get list of supported languages for ICD-11"""
        # Common ICD-11 language codes
        return {
            "supported_languages": {
                "en": "English",
                "ar": "Arabic", 
                "zh": "Chinese",
                "es": "Spanish",
                "fr": "French",
                "ru": "Russian",
                "no": "Norwegian (when available)",
                "nb": "Norwegian Bokmål (when available)", 
                "nn": "Norwegian Nynorsk (when available)"
            },
            "note": "Norwegian support is upcoming. Currently using English as fallback."
        }

    async def search_with_fallback(self, query: str, preferred_language: str = "no", use_flexisearch: bool = True) -> Dict[Any, Any]:
        """Search with language fallback for Norwegian support"""
        try:
            # Try preferred language first
            results = await self.search_entities(query, use_flexisearch, preferred_language)
            return {"results": results, "language_used": preferred_language, "fallback_used": False}
        except Exception as e:
            # Fallback to English if Norwegian not available
            if preferred_language in ["no", "nb", "nn"]:
                results = await self.search_entities(query, use_flexisearch, "en")
                return {"results": results, "language_used": "en", "fallback_used": True, "fallback_reason": "Norwegian not yet available"}
            else:
                raise e
    
    async def get_foundation_entities(self, language: str = "en") -> Dict[Any, Any]:
        """Get foundation entities from ICD-11"""
        endpoint = f"release/11/2023-01/mms/en"
        return await self._make_request(endpoint)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()