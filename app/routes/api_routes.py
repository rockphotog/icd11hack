"""API route handlers for ICD-11 operations"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..api.icd11_client import ICD11Client

router = APIRouter()
icd11_client = ICD11Client()


@router.get("/search")
async def search_icd11_entities(
    q: str = Query(..., description="Search query for ICD-11 entities"),
    flexisearch: bool = Query(True, description="Use flexible search")
):
    """Search for ICD-11 entities"""
    try:
        results = await icd11_client.search_entities(q, flexisearch)
        return {"query": q, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entity/{entity_id}")
async def get_entity(entity_id: str):
    """Get specific ICD-11 entity by ID"""
    try:
        entity = await icd11_client.get_entity(entity_id)
        return {"entity_id": entity_id, "data": entity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/foundation")
async def get_foundation_entities(language: str = Query("en", description="Language code")):
    """Get foundation entities"""
    try:
        entities = await icd11_client.get_foundation_entities(language)
        return {"language": language, "entities": entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    await icd11_client.close()