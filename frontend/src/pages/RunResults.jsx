import React, { useEffect, useState } from 'react';
import { fetchTestRun, fetchReportSummary } from '../api/client';
import ScoreSummaryCard from '../components/ScoreSummaryCard';
import ResultsTable from '../components/ResultsTable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';

export default function RunResults({ runId }) {
  const [run, setRun] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!runId) return;
    try {
      setLoading(true);
      const [runData, summaryData] = await Promise.all([
        fetchTestRun(runId),
        fetchReportSummary(runId)
      ]);
      setRun(runData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll status if running
    const interval = setInterval(() => {
      if (run && run.status === 'running') {
        loadData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [runId, run?.status]);

  if (!runId) {
    return (
      <div className="text-center py-12 text-slate-400">
        Please submit a target or select a run to view results.
      </div>
    );
  }

  if (loading && !run) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyber-cyan" />
        <p>Fetching evaluation report for Run #{runId}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
        Failed to load test run: {error}
      </div>
    );
  }

  // Format Recharts Category Bar Chart Data
  const chartData = summary?.category_breakdown
    ? Object.keys(summary.category_breakdown).map((cat) => ({
        category: cat.replace('_', ' '),
        passed: summary.category_breakdown[cat].passed || 0,
        failed: summary.category_breakdown[cat].failed || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Run #{run.id} — <span className="text-cyber-cyan">{run.target_info?.name || 'Target'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Status: <span className={`uppercase font-semibold ${run.status === 'completed' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>{run.status}</span> | Created: {new Date(run.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
          title="Refresh Results"
        >
          <RefreshCw className={`w-4 h-4 ${run?.status === 'running' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ScoreSummaryCard run={run} summary={summary} />

      {/* Recharts Pass/Fail Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/50">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Pass / Fail Breakdown by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <XAxis dataKey="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="passed" name="Robust (Pass)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Vulnerable (Fail)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Detailed Adversarial Evaluation Log
        </h3>
        <ResultsTable results={run.results} />
      </div>
    </div>
  );
}
