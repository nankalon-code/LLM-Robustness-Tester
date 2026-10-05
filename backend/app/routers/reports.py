from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.db import get_db
from app.models import TestRun, TestResult, Target
from app.schemas import ReportSummary, RegressionDiff
from app.services.guardrail_patcher import guardrail_patcher
from app.services.test_runner import execute_test_run, calculate_overall_score

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


@router.post("/verify-patch/{run_id}")
async def verify_patch(
    run_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    1-Click Closed-Loop Verification:
    Retrieves or synthesizes the hardened target for run_id, initializes a dedicated
    verification benchmark run against the hardened prompt, and triggers background execution.
    """
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Original test run not found")

    # 1. Synthesize or get hardened target
    try:
        remediation = await guardrail_patcher.auto_patch(db=db, run_id=run_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating hardened target: {str(e)}")

    hardened_target_id = remediation.get("hardened_target_id")
    hardened_target = db.query(Target).filter(Target.id == hardened_target_id).first()
    if not hardened_target:
        raise HTTPException(status_code=500, detail="Failed to locate synthesized hardened target")

    target_info = {
        "id": hardened_target.id,
        "name": hardened_target.name,
        "target_type": "system_prompt",
        "content": hardened_target.content
    }

    # 2. Spawn a new verification TestRun linked to the hardened prompt
    verification_run = TestRun(
        target_id=hardened_target.id,
        target_info=target_info,
        selected_strategy=run.selected_strategy or "all_perez_strategies",
        red_team_generator_model=run.red_team_generator_model,
        evaluator_judge_model=run.evaluator_judge_model,
        status="pending"
    )
    db.add(verification_run)
    db.commit()
    db.refresh(verification_run)

    # 3. Schedule async execution with isolated DB session
    background_tasks.add_task(execute_test_run, verification_run.id)

    return {
        "status": "success",
        "original_run_id": run_id,
        "verification_run_id": verification_run.id,
        "hardened_target_id": hardened_target.id,
        "hardened_name": hardened_target.name,
        "message": "Closed-loop verification benchmark launched successfully!"
    }


@router.get("/export/{run_id}")
def export_audit_dossier(
    run_id: int,
    format: str = "markdown",
    db: Session = Depends(get_db)
):
    """
    Exports a comprehensive, publication-grade Security Audit & Vulnerability Dossier.
    Available formats: 'markdown' (.md attachment) or 'json'.
    """
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    results = db.query(TestResult).filter(TestResult.run_id == run_id).all()
    target_info = run.target_info or {}
    target_name = target_info.get("name", f"Target Specimen #{run.target_id or run_id}")
    overall_score = run.overall_score if run.overall_score is not None else calculate_overall_score(results)

    passed_count = sum(1 for r in results if r.label == "robust")
    failed_count = sum(1 for r in results if r.label == "vulnerable")
    ambiguous_count = sum(1 for r in results if r.label == "ambiguous")

    if format == "json":
        return {
            "run_id": run.id,
            "target_name": target_name,
            "target_info": target_info,
            "overall_score": overall_score,
            "created_at": str(run.created_at),
            "evaluator_judge_model": run.evaluator_judge_model,
            "total_probes": len(results),
            "passed": passed_count,
            "failed": failed_count,
            "ambiguous": ambiguous_count,
            "findings": [
                {
                    "test_case_id": r.test_case_id,
                    "category": r.test_case.category if r.test_case else "unknown",
                    "strategy": r.strategy,
                    "label": r.label,
                    "severity": r.severity,
                    "explanation": r.explanation,
                    "prompt": r.test_case.prompt_or_turns if r.test_case else "",
                    "response": r.response_text,
                    "broke_at_turn": r.broke_at_turn
                }
                for r in results
            ]
        }

    # Build High-Impact Markdown Security Report
    lines = [
        f"# 🛡️ LLM SECURITY AUDIT & VULNERABILITY DOSSIER",
        f"",
        f"**Target System:** `{target_name}`  ",
        f"**Audit Run ID:** `#{run.id}` | **Status:** `{run.status.upper()}`  ",
        f"**Evaluation Timestamp:** `{run.created_at}`  ",
        f"**Evaluator Judge Model:** `{run.evaluator_judge_model or 'qwen2.5:3b'}`  ",
        f"**Red Teaming Strategy:** `{(run.selected_strategy or 'all_perez_strategies').upper()}`  ",
        f"",
        f"---",
        f"",
        f"## 1. Executive Summary & Robustness Index",
        f"",
        f"- **Empirical Robustness Score:** **`{overall_score:.1f} / 100.0`**",
        f"- **Security Posture:** `{'CRITICAL VULNERABILITIES DETECTED' if failed_count > 0 else 'VERIFIED ROBUST DEFENSE'}`",
        f"- **Total Adversarial Probes:** `{len(results)}`",
        f"- **Robust Defenses (Pass):** `{passed_count}` ({round((passed_count/len(results)*100), 1) if results else 100}%)",
        f"- **Vulnerability Breaches (Fail):** `{failed_count}`",
        f"- **Ambiguous Responses:** `{ambiguous_count}`",
        f"",
        f"---",
        f"",
        f"## 2. Threat Vector Breakdown (OWASP Top 10 for LLMs)",
        f"",
        f"| Threat Category | Total Probes | Robust (Pass) | Vulnerable (Fail) | Ambiguous | Status |",
        f"| :--- | :---: | :---: | :---: | :---: | :--- |"
    ]

    # Category counts
    cats: Dict[str, Dict[str, int]] = {}
    for r in results:
        c = r.test_case.category if (r.test_case and r.test_case.category) else "general_probe"
        cats.setdefault(c, {"total": 0, "pass": 0, "fail": 0, "amb": 0})
        cats[c]["total"] += 1
        if r.label == "robust":
            cats[c]["pass"] += 1
        elif r.label == "vulnerable":
            cats[c]["fail"] += 1
        else:
            cats[c]["amb"] += 1

    for c, stats in sorted(cats.items()):
        status = "✅ SECURE" if stats["fail"] == 0 else f"🚨 {stats['fail']} BREACHES"
        lines.append(f"| `{c}` | {stats['total']} | {stats['pass']} | {stats['fail']} | {stats['amb']} | {status} |")

    lines.extend([
        f"",
        f"---",
        f"",
        f"## 3. Vulnerability Findings & Exploitation Telemetry",
        f""
    ])

    vulnerable_findings = [r for r in results if r.label == "vulnerable"]
    if not vulnerable_findings:
        lines.append("*No vulnerability breaches detected. Target safely rejected or mitigated all evaluated attack vectors.*")
    else:
        for idx, r in enumerate(vulnerable_findings, 1):
            cat = r.test_case.category if r.test_case else "general"
            sev = (r.severity or "medium").upper()
            prompt = r.test_case.prompt_or_turns if r.test_case else "N/A"
            resp = r.response_text or "No response captured"
            turn_note = f" (Collapsing at Turn {r.broke_at_turn})" if r.broke_at_turn else ""

            lines.extend([
                f"### Finding #{idx}: [{sev}] `{cat}`{turn_note}",
                f"- **Strategy:** `{r.strategy or 'seed_benchmark'}`",
                f"- **Judge Explanation:** {r.explanation or 'Safety violation identified by LLM Judge.'}",
                f"",
                f"**Adversarial Probe Input:**",
                f"```text",
                f"{prompt}",
                f"```",
                f"",
                f"**Target System Response:**",
                f"```text",
                f"{resp[:600]}{'...' if len(resp) > 600 else ''}",
                f"```",
                f""
            ])

    lines.extend([
        f"---",
        f"",
        f"## 4. Methodology & Theoretical Foundation",
        f"This evaluation was executed pursuant to DeepMind & NYU research:",
        f"> *Perez et al. (2022) — Red Teaming Language Models with Language Models.*",
        f"",
        f"Scoring is empirical, severity-calibrated (Critical=10.0, High=5.0, Medium=2.5, Low=1.0), and enforces deterministic fast-path refusal heuristics with zero-temperature JSON judge rubrics.",
        f"",
        f"*Report generated automatically by LLM Robustness Tester.*"
    ])

    markdown_content = "\n".join(lines)
    filename = f"llm_security_audit_run_{run_id}.md"

    return Response(
        content=markdown_content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


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
