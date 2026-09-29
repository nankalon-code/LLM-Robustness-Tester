from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# Target Schemas
class TargetBase(BaseModel):
    name: str
    target_type: str # 'prompt', 'system_prompt', 'api_endpoint'
    content: str

class TargetCreate(TargetBase):
    pass

class TargetResponse(TargetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# TestCase Schemas
class TestCaseBase(BaseModel):
    id: str
    category: str
    severity_hint: str
    is_multi_turn: int = 0
    prompt_or_turns: Any
    description: Optional[str] = None
    strategy: Optional[str] = "seed_benchmark"

class TestCaseResponse(TestCaseBase):
    class Config:
        from_attributes = True

# TestResult Schemas
class TestResultResponse(BaseModel):
    id: int
    run_id: int
    test_case_id: str
    response_text: Optional[str] = None
    label: Optional[str] = None
    severity: Optional[str] = None
    explanation: Optional[str] = None
    strategy: Optional[str] = "seed_benchmark"
    is_offensive_content: Optional[int] = 0
    broke_at_turn: Optional[int] = None
    test_case: Optional[TestCaseResponse] = None

    class Config:
        from_attributes = True

# TestRun Schemas
class TestRunCreate(BaseModel):
    target_id: Optional[int] = None
    target_info: Optional[Dict[str, Any]] = None
    selected_strategy: Optional[str] = "all_perez_strategies"
    red_team_generator_model: Optional[str] = "qwen:qwen2.5:3b"

class TestRunResponse(BaseModel):
    id: int
    target_id: Optional[int] = None
    target_info: Optional[Dict[str, Any]] = None
    status: str
    overall_score: Optional[float] = None
    selected_strategy: Optional[str] = "all_perez_strategies"
    red_team_generator_model: Optional[str] = "qwen:qwen2.5:3b"
    evaluator_judge_model: Optional[str] = "qwen:qwen2.5:3b"
    strategy_breakdown: Optional[Dict[str, Any]] = None
    created_at: datetime
    results: List[TestResultResponse] = []

    class Config:
        from_attributes = True

# Aggregated Report & Regression Schemas
class ReportSummary(BaseModel):
    run_id: int
    target_info: Optional[Dict[str, Any]]
    status: str
    overall_score: Optional[float]
    selected_strategy: Optional[str] = "all_perez_strategies"
    total_tests: int
    passed_tests: int
    failed_tests: int
    category_breakdown: Dict[str, Dict[str, int]]
    severity_breakdown: Dict[str, int]
    strategy_breakdown: Dict[str, Dict[str, Any]] = {}
    created_at: datetime

class RegressionDiff(BaseModel):
    run_a_id: int
    run_b_id: int
    score_change: float
    new_vulnerabilities: List[Dict[str, Any]]
    fixed_vulnerabilities: List[Dict[str, Any]]
    unchanged_vulnerabilities: List[Dict[str, Any]]
