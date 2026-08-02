from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.models.model_manager import model_manager

router = APIRouter()

class APIKeyUpdate(BaseModel):
    api_key: str

@router.get("/")
def list_models():
    return {
        "active_provider": "Groq",
        "models": model_manager.get_supported_models()
    }

@router.post("/key")
def update_groq_key(req: APIKeyUpdate):
    if not req.api_key or not req.api_key.strip():
        return {"error": "Invalid API key"}
    model_manager.update_api_key(req.api_key.strip())
    return {"message": "Groq API key updated successfully"}
