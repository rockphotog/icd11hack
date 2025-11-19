"""API route handlers for ICD-11 operations"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..api.icd11_client import ICD11Client

router = APIRouter()
icd11_client = ICD11Client()


@router.get("/search")
async def search_icd11_entities(
    q: str = Query(..., description="Search query for ICD-11 entities"),
    flexisearch: bool = Query(True, description="Use flexible search"),
    language: str = Query("en", description="Language code (en, no, nb, nn, etc.)")
):
    """Search for ICD-11 entities with multi-language support"""
    try:
        if language in ["no", "nb", "nn"]:
            # Use fallback for Norwegian
            result = await icd11_client.search_with_fallback(q, language, flexisearch)
            return {
                "query": q, 
                "language_requested": language,
                "language_used": result["language_used"],
                "fallback_used": result.get("fallback_used", False),
                "results": result["results"]
            }
        else:
            results = await icd11_client.search_entities(q, flexisearch, language)
            return {
                "query": q, 
                "language_requested": language,
                "language_used": language,
                "fallback_used": False,
                "results": results
            }
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


@router.get("/entity/{entity_id}/details")
async def get_entity_details(
    entity_id: str,
    language: str = Query("en", description="Language code"),
    include_children: bool = Query(False, description="Include child entities")
):
    """Get comprehensive details for a specific ICD-11 entity"""
    try:
        entity = await icd11_client.get_entity_details(
            entity_id, language, include_children
        )
        return {
            "entity_id": entity_id,
            "language": language,
            "data": entity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entity/{entity_id}/hierarchy")
async def get_entity_hierarchy(
    entity_id: str,
    language: str = Query("en", description="Language code")
):
    """Get hierarchy (parents/children) for a specific ICD-11 entity"""
    try:
        hierarchy = await icd11_client.get_entity_hierarchy(entity_id, language)
        return {
            "entity_id": entity_id,
            "language": language,
            "hierarchy": hierarchy
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for ICD-11"""
    try:
        languages = await icd11_client.get_supported_languages()
        return languages
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