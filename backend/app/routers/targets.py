from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.db import get_db
from app.models import Target
from app.schemas import TargetCreate, TargetResponse
from app.services.llm_client import llm_client
from app.services.judge import judge

router = APIRouter(prefix="/api/targets", tags=["targets"])

class ChatRequest(BaseModel):
    system_prompt: str
    messages: List[Dict[str, str]]
    model: Optional[str] = "qwen:qwen2.5:7b"

class ChatResponse(BaseModel):
    response: str
    evaluation: Dict[str, Any]

@router.post("/chat", response_model=ChatResponse)
async def chat_with_target(req: ChatRequest):
    """
    Live Chatbot testing endpoint.
    Sends conversation history to target LLM, then passes response through Judge evaluation.
    """
    user_prompt = req.messages[-1]["content"] if req.messages else ""
    
    target_response = await llm_client.generate_response(
        messages=req.messages,
        model=req.model,
        system_prompt=req.system_prompt
    )

    eval_result = await judge.evaluate(
        category="interactive_chat",
        prompt=user_prompt,
        response_text=target_response
    )

    return ChatResponse(
        response=target_response,
        evaluation=eval_result
    )

@router.post("/", response_model=TargetResponse)
def create_target(target: TargetCreate, db: Session = Depends(get_db)):
    db_target = Target(
        name=target.name,
        target_type=target.target_type,
        content=target.content
    )
    db.add(db_target)
    db.commit()
    db.refresh(db_target)
    return db_target

@router.get("/", response_model=List[TargetResponse])
def list_targets(db: Session = Depends(get_db)):
    return db.query(Target).order_by(Target.created_at.desc()).all()

@router.get("/{target_id}", response_model=TargetResponse)
def get_target(target_id: int, db: Session = Depends(get_db)):
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target
