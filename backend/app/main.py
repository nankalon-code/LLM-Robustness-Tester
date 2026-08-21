import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base, SessionLocal
from app.models import TestCase
from app.routers import targets, test_runs, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LLM Robustness Tester API",
    description="Local-first adversarial evaluation and security benchmarking for LLMs",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(targets.router)
app.include_router(test_runs.router)
app.include_router(reports.router)

@app.on_event("startup")
def seed_test_cases():
    """Seeds the database with starter single-turn and multi-turn adversarial test cases if empty."""
    db = SessionLocal()
    try:
        count = db.query(TestCase).count()
        if count == 0:
            json_path = os.path.join(os.path.dirname(__file__), "data", "seed_test_cases.json")
            if os.path.exists(json_path):
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Seed Single-Turn test cases
                for st in data.get("single_turn", []):
                    tc = TestCase(
                        id=st["id"],
                        category=st["category"],
                        severity_hint=st["severity_hint"],
                        is_multi_turn=0,
                        prompt_or_turns=st["prompt"],
                        description=st.get("description", "Single turn prompt test case")
                    )
                    db.add(tc)

                # Seed Multi-Turn test cases
                for mt in data.get("multi_turn", []):
                    tc = TestCase(
                        id=mt["id"],
                        category=mt["category"],
                        severity_hint="critical", # Default escalation severity hint
                        is_multi_turn=1,
                        prompt_or_turns=mt["turns"],
                        description=mt.get("description", "Multi-turn scripted escalation")
                    )
                    db.add(tc)

                db.commit()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "LLM Robustness Tester API is running"}
