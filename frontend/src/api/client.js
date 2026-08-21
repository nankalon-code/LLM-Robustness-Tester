const API_BASE = '/api';

export async function fetchTargets() {
  const res = await fetch(`${API_BASE}/targets/`);
  if (!res.ok) throw new Error('Failed to fetch targets');
  return res.json();
}

export async function createTarget(targetData) {
  const res = await fetch(`${API_BASE}/targets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(targetData)
  });
  if (!res.ok) throw new Error('Failed to create target');
  return res.json();
}

export async function createTestRun(runData) {
  const res = await fetch(`${API_BASE}/test-runs/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runData)
  });
  if (!res.ok) throw new Error('Failed to initiate test run');
  return res.json();
}

export async function fetchTestRuns() {
  const res = await fetch(`${API_BASE}/test-runs/`);
  if (!res.ok) throw new Error('Failed to fetch test runs');
  return res.json();
}

export async function fetchTestRun(runId) {
  const res = await fetch(`${API_BASE}/test-runs/${runId}`);
  if (!res.ok) throw new Error('Failed to fetch test run details');
  return res.json();
}

export async function fetchReportSummary(runId) {
  const res = await fetch(`${API_BASE}/reports/summary/${runId}`);
  if (!res.ok) throw new Error('Failed to fetch report summary');
  return res.json();
}

export async function fetchRegressionDiff(runAId, runBId) {
  const res = await fetch(`${API_BASE}/reports/regression?run_a_id=${runAId}&run_b_id=${runBId}`);
  if (!res.ok) throw new Error('Failed to fetch regression diff');
  return res.json();
}
