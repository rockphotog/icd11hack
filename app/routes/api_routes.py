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


@router.get("/search/enhanced")
async def enhanced_search(
    q: str = Query(..., description="Search query (text or ICD-11 code)"),
    search_type: str = Query("mms", description="Search type: 'mms' or 'foundation'"),
    release: str = Query("2025-01", description="ICD-11 release version"),
    language: str = Query("en", description="Language code"),
    flexisearch: bool = Query(True, description="Use flexible search for text queries")
):
    """Enhanced search that automatically detects codes and searches appropriately"""
    try:
        result = await icd11_client.enhanced_search(
            q, search_type, release, language, flexisearch
        )
        
        # Post-process results to prioritize exact code matches
        is_code_query = result.get("query_type") == "code"
        has_entities = result.get("results", {}).get("destinationEntities")
        
        if is_code_query and has_entities:
            entities = result["results"]["destinationEntities"]
            query_code = q.strip().upper()
            
            # Find exact code matches and partial matches
            exact_matches = []
            partial_matches = []
            
            for entity in entities:
                entity_code = entity.get("theCode", "")
                if entity_code == query_code:
                    exact_matches.append(entity)
                else:
                    partial_matches.append(entity)
            
            # If we have exact matches, put them first
            if exact_matches:
                result["results"]["destinationEntities"] = (
                    exact_matches + partial_matches
                )
                result["exact_matches_found"] = len(exact_matches)
            else:
                # If no exact matches found, try fallback text searches
                fallback_searches = [
                    f"{q}",  # Search for the code as text
                    f"diabetes {q}",  # Try with diabetes context
                    "type 1 diabetes",  # Try broad diabetes search for 5A10
                    f"endocrine {q}",  # Try with endocrine context
                ]
                
                for search_term in fallback_searches:
                    text_result = await icd11_client.search_mms(
                        search_term, release, language, True
                    )
                    if text_result.get("destinationEntities"):
                        # Find entities with matching codes in text search
                        for entity in text_result["destinationEntities"]:
                            if entity.get("theCode") == query_code:
                                # Prepend exact match from text search
                                result["results"]["destinationEntities"].insert(
                                    0, entity
                                )
                                result["exact_matches_found"] = 1
                                result["fallback_search_used"] = True
                                result["fallback_search_term"] = search_term
                                # Found a match, break out of both loops
                                break
                    if result.get("fallback_search_used"):
                        break
        
        return {
            "query": q,
            "search_type": search_type,
            "release": release,
            "language": language,
            **result
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


@router.get("/mms")
async def get_mms_entities(
    release: str = Query("2025-01", description="Release version"),
    language: str = Query("en", description="Language code")
):
    """Get MMS (Mortality and Morbidity Statistics) linearization entities"""
    try:
        entities = await icd11_client.get_mms_entities(release, language)
        return {"release": release, "language": language, "entities": entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mms/search")
async def search_mms(
    q: str = Query(..., description="Search query for MMS entities"),
    release: str = Query("2025-01", description="Release version"),
    language: str = Query("en", description="Language code"),
    flexisearch: bool = Query(True, description="Use flexible search")
):
    """Search MMS linearization for official medical codes"""
    try:
        results = await icd11_client.search_mms(q, release, language, flexisearch)
        return {
            "query": q,
            "release": release,
            "language": language,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mms/entity/{entity_id}")
async def get_mms_entity(
    entity_id: str,
    release: str = Query("2025-01", description="Release version"),
    language: str = Query("en", description="Language code")
):
    """Get specific entity from MMS linearization"""
    try:
        entity = await icd11_client.get_mms_entity(entity_id, release, language)
        return {
            "entity_id": entity_id,
            "release": release,
            "language": language,
            "data": entity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    await icd11_client.close()