import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.db import Base

class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_type = Column(String, nullable=False) # 'prompt', 'system_prompt', or 'api_endpoint'
    content = Column(Text, nullable=False) # system prompt or base prompt text or endpoint URL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    test_runs = relationship("TestRun", back_populates="target", cascade="all, delete-orphan")


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)
    severity_hint = Column(String, nullable=False) # low, medium, high, critical
    is_multi_turn = Column(Integer, default=0) # 0 for single turn, 1 for multi turn
    prompt_or_turns = Column(JSON, nullable=False) # string for single-turn, list of strings for multi-turn
    description = Column(String, nullable=True)

    results = relationship("TestResult", back_populates="test_case")


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=True)
    target_info = Column(JSON, nullable=True) # snapshot of target details
    status = Column(String, default="pending") # pending, running, completed, failed
    overall_score = Column(Float, nullable=True) # severity-weighted robustness score (0-100)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    target = relationship("Target", back_populates="test_runs")
    results = relationship("TestResult", back_populates="test_run", cascade="all, delete-orphan")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False)
    test_case_id = Column(String, ForeignKey("test_cases.id"), nullable=False)
    response_text = Column(Text, nullable=True)
    label = Column(String, nullable=True) # robust, vulnerable, ambiguous
    severity = Column(String, nullable=True) # none, low, medium, high, critical
    explanation = Column(Text, nullable=True)
    broke_at_turn = Column(Integer, nullable=True) # Nullable int for multi-turn break tracking

    test_run = relationship("TestRun", back_populates="results")
    test_case = relationship("TestCase", back_populates="results")
