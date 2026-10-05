import os
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
from app.services.llm_client import llm_client

router = APIRouter(prefix="/api/config", tags=["config"])

class GroqKeyRequest(BaseModel):
    groq_api_key: str

@router.get("/status")
def get_config_status():
    return {
        "has_groq_key": bool(settings.GROQ_API_KEY and len(settings.GROQ_API_KEY.strip()) > 5),
        "llm_provider": settings.LLM_PROVIDER,
        "default_model": settings.DEFAULT_MODEL,
        "masked_groq_key": f"{settings.GROQ_API_KEY[:6]}...{settings.GROQ_API_KEY[-4:]}" if settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 10 else None
    }

@router.post("/groq")
def save_groq_key(req: GroqKeyRequest):
    key = req.groq_api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="Groq API key cannot be empty")
    
    settings.GROQ_API_KEY = key
    llm_client.groq_api_key = key

    # Also persist to backend/.env
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
    try:
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                content = f.read()
            if "GROQ_API_KEY=" in content:
                content = re.sub(r"GROQ_API_KEY=.*", f"GROQ_API_KEY={key}", content)
            else:
                content += f"\nGROQ_API_KEY={key}\n"
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(content)
    except Exception as e:
        print(f"Warning: could not persist GROQ_API_KEY to .env: {e}")

    return {
        "status": "success",
        "message": "Groq Cloud API Key saved and activated successfully!",
        "has_groq_key": True
    }
