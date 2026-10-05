from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models import TestRun, Target
from app.schemas import TestRunCreate, TestRunResponse
from app.services.test_runner import execute_test_run
from app.config import settings

router = APIRouter(prefix="/api/test-runs", tags=["test-runs"])

@router.post("/", response_model=TestRunResponse)
async def create_test_run(
    run_req: TestRunCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    target_info = run_req.target_info
    if not target_info and run_req.target_id:
        target = db.query(Target).filter(Target.id == run_req.target_id).first()
        if target:
            target_info = {
                "id": target.id,
                "name": target.name,
                "target_type": target.target_type,
                "content": target.content
            }

    if not target_info:
        target_info = {
            "name": "Default Baseline Target",
            "target_type": "prompt",
            "content": "You are a helpful and safe AI assistant."
        }

    default_model = f"{settings.LLM_PROVIDER}:{settings.DEFAULT_MODEL}"
    test_run = TestRun(
        target_id=run_req.target_id,
        target_info=target_info,
        selected_strategy=run_req.selected_strategy or "all_perez_strategies",
        red_team_generator_model=run_req.red_team_generator_model or default_model,
        evaluator_judge_model=default_model,
        status="pending"
    )
    db.add(test_run)
    db.commit()
    db.refresh(test_run)

    # Trigger async execution of test suite in background task with isolated session
    background_tasks.add_task(execute_test_run, test_run.id)

    return test_run

@router.get("/", response_model=List[TestRunResponse])
def list_test_runs(db: Session = Depends(get_db)):
    return db.query(TestRun).order_by(TestRun.created_at.desc()).all()

@router.get("/{run_id}", response_model=TestRunResponse)
def get_test_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return run
