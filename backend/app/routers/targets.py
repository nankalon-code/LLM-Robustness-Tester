from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models import Target
from app.schemas import TargetCreate, TargetResponse

router = APIRouter(prefix="/api/targets", tags=["targets"])

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
