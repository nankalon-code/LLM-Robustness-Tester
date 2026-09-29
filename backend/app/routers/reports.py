from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db import get_db
from app.models import TestRun, TestResult
from app.schemas import ReportSummary, RegressionDiff
from app.services.guardrail_patcher import guardrail_patcher

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("/auto-patch/{run_id}")
async def auto_patch_guardrails(run_id: int, db: Session = Depends(get_db)):
    """
    Analyzes failed test cases in a run, synthesizes an optimized hardened prompt v2,
    stores it as a new candidate Target, and returns the patch mitigations.
    """
    try:
        remediation = await guardrail_patcher.auto_patch(db=db, run_id=run_id)
        return remediation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to auto-patch guardrails: {str(e)}")


@router.get("/summary/{run_id}", response_model=ReportSummary)
def get_report_summary(run_id: int, db: Session = Depends(get_db)):
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    results = db.query(TestResult).filter(TestResult.run_id == run_id).all()
    
    passed_tests = sum(1 for r in results if r.label == "robust")
    failed_tests = sum(1 for r in results if r.label == "vulnerable")
    
    category_breakdown: Dict[str, Dict[str, int]] = {}
    severity_breakdown = {"none": 0, "low": 0, "medium": 0, "high": 0, "critical": 0}

    for r in results:
        cat = r.test_case.category if (r.test_case and r.test_case.category) else "roleplay_bypass"
        if cat not in category_breakdown:
            category_breakdown[cat] = {"passed": 0, "failed": 0, "ambiguous": 0}
        
        if r.label == "robust":
            category_breakdown[cat]["passed"] += 1
        elif r.label == "vulnerable":
            category_breakdown[cat]["failed"] += 1
        else:
            category_breakdown[cat]["ambiguous"] += 1

        sev = (r.severity or "none").lower()
        if sev in severity_breakdown:
            severity_breakdown[sev] += 1
        else:
            severity_breakdown["medium"] += 1

    # Dynamic strategy breakdown calculation from all results
    strat_breakdown = dict(run.strategy_breakdown or {})
    for r in results:
        strat = r.strategy or "seed_benchmark"
        if strat not in strat_breakdown:
            strat_breakdown[strat] = {"total": 0, "passed": 0, "failed": 0, "ambiguous": 0, "pass_rate": 100.0}
        strat_breakdown[strat]["total"] += 1
        if r.label == "robust":
            strat_breakdown[strat]["passed"] += 1
        elif r.label == "vulnerable":
            strat_breakdown[strat]["failed"] += 1
        else:
            strat_breakdown[strat]["ambiguous"] = strat_breakdown[strat].get("ambiguous", 0) + 1

    for s, data in strat_breakdown.items():
        if data.get("total", 0) > 0:
            data["pass_rate"] = round((data.get("passed", 0) / data["total"]) * 100.0, 1)

    from app.services.test_runner import calculate_overall_score
    overall_score = calculate_overall_score(results) if results else 100.0
    if run.overall_score != overall_score:
        run.overall_score = overall_score
        db.commit()

    return ReportSummary(
        run_id=run.id,
        target_info=run.target_info,
        status=run.status,
        overall_score=overall_score,
        selected_strategy=run.selected_strategy or "all_perez_strategies",
        total_tests=len(results),
        passed_tests=passed_tests,
        failed_tests=failed_tests,
        category_breakdown=category_breakdown,
        severity_breakdown=severity_breakdown,
        strategy_breakdown=strat_breakdown,
        created_at=run.created_at
    )


@router.get("/regression", response_model=RegressionDiff)
def get_regression_diff(run_a_id: int, run_b_id: int, db: Session = Depends(get_db)):
    run_a = db.query(TestRun).filter(TestRun.id == run_a_id).first()
    run_b = db.query(TestRun).filter(TestRun.id == run_b_id).first()

    if not run_a or not run_b:
        raise HTTPException(status_code=404, detail="One or both test runs were not found")

    results_a = {r.test_case_id: r for r in db.query(TestResult).filter(TestResult.run_id == run_a_id).all()}
    results_b = {r.test_case_id: r for r in db.query(TestResult).filter(TestResult.run_id == run_b_id).all()}

    score_change = round((run_b.overall_score or 0.0) - (run_a.overall_score or 0.0), 2)

    new_vulnerabilities = []
    fixed_vulnerabilities = []
    unchanged_vulnerabilities = []

    all_case_ids = set(results_a.keys()).union(set(results_b.keys()))

    for case_id in all_case_ids:
        res_a = results_a.get(case_id)
        res_b = results_b.get(case_id)

        vuln_a = res_a and res_a.label == "vulnerable"
        vuln_b = res_b and res_b.label == "vulnerable"

        item = {
            "test_case_id": case_id,
            "category": res_b.test_case.category if (res_b and res_b.test_case) else (res_a.test_case.category if (res_a and res_a.test_case) else "roleplay_bypass"),
            "strategy": res_b.strategy if res_b else (res_a.strategy if res_a else "seed_benchmark"),
            "run_a_label": res_a.label if res_a else None,
            "run_b_label": res_b.label if res_b else None,
            "run_a_severity": res_a.severity if res_a else None,
            "run_b_severity": res_b.severity if res_b else None,
            "run_a_broke_turn": res_a.broke_at_turn if res_a else None,
            "run_b_broke_turn": res_b.broke_at_turn if res_b else None,
        }

        if not vuln_a and vuln_b:
            new_vulnerabilities.append(item)
        elif vuln_a and not vuln_b:
            fixed_vulnerabilities.append(item)
        elif vuln_a and vuln_b:
            unchanged_vulnerabilities.append(item)

    return RegressionDiff(
        run_a_id=run_a_id,
        run_b_id=run_b_id,
        score_change=score_change,
        new_vulnerabilities=new_vulnerabilities,
        fixed_vulnerabilities=fixed_vulnerabilities,
        unchanged_vulnerabilities=unchanged_vulnerabilities
    )
