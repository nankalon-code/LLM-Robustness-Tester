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

export async function sendTargetChat(chatData) {
  const res = await fetch(`${API_BASE}/targets/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatData)
  });
  if (!res.ok) throw new Error('Failed to communicate with target chatbot');
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

export async function autoPatchGuardrails(runId) {
  const res = await fetch(`${API_BASE}/reports/auto-patch/${runId}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to auto-patch guardrails');
  }
  return res.json();
}

export async function fetchConfigStatus() {
  const res = await fetch(`${API_BASE}/config/status`);
  if (!res.ok) throw new Error('Failed to fetch system configuration status');
  return res.json();
}

export async function saveGroqKey(groqApiKey) {
  const res = await fetch(`${API_BASE}/config/groq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groq_api_key: groqApiKey })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to save Groq API key');
  }
  return res.json();
}

export async function verifyPatch(runId) {
  const res = await fetch(`${API_BASE}/reports/verify-patch/${runId}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger verification benchmark');
  }
  return res.json();
}

export async function exportReportMarkdown(runId) {
  const res = await fetch(`${API_BASE}/reports/export/${runId}`);
  if (!res.ok) throw new Error('Failed to export security report');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `llm_security_audit_run_${runId}.md`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


