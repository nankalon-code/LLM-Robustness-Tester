import React, { useEffect, useState } from 'react';
import { fetchTestRun, fetchReportSummary, exportReportMarkdown } from '../api/client';
import ScoreSummaryCard from '../components/ScoreSummaryCard';
import NeuralScanVisualizer from '../components/NeuralScanVisualizer';
import StrategyComparisonChart from '../components/StrategyComparisonChart';
import ResultsTable from '../components/ResultsTable';
import AutoPatchGuardrailCard from '../components/AutoPatchGuardrailCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, RefreshCw, Activity, Cpu, Download } from 'lucide-react';

export default function RunResults({ runId, onRunStarted }) {
  const [run, setRun] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!runId) return;
    try {
      setExporting(true);
      await exportReportMarkdown(runId);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

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
    const interval = setInterval(() => {
      if (run && run.status === 'running') {
        loadData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [runId, run?.status]);

  if (!runId) {
    return (
      <div className="text-center py-16 text-stone-700 font-mono font-bold border-2 border-stone-900 rounded-xl bg-[#FAF6EE] shadow-[4px_4px_0px_#1C1917]">
        Please submit a target or select a test run from the dropdown above to view classified telemetry results.
      </div>
    );
  }

  if (loading && !run) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-900 space-y-4 font-mono font-bold">
        <Loader2 className="w-8 h-8 animate-spin text-[#F95738]" />
        <p className="text-xs uppercase tracking-wider">Fetching Classified Telemetry Dossier for Run #{runId}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#F95738] text-white border-2 border-stone-900 rounded-xl text-center font-mono text-xs font-bold shadow-[4px_4px_0px_#1C1917]">
        Failed to load test run: {error}
      </div>
    );
  }

  const categoryChartData = summary?.category_breakdown
    ? Object.keys(summary.category_breakdown).map((cat) => ({
        category: cat.replaceAll('_', ' '),
        passed: summary.category_breakdown[cat].passed || 0,
        failed: summary.category_breakdown[cat].failed || 0,
        ambiguous: summary.category_breakdown[cat].ambiguous || 0,
      }))
    : [];

  return (
    <div className="space-y-6 font-mono">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-stone-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">
              SAFETY AUDIT REPORT #{run.id} — <span className="text-[#F95738]">{run.target_info?.name || 'Target'}</span>
            </h2>
            <span className="stamp-specimen text-[10px]">STRATEGY: {(run.selected_strategy || 'ALL PEREZ').replaceAll('_', ' ')}</span>
          </div>
          <p className="text-xs text-stone-700 font-bold mt-1 flex items-center gap-3">
            <span>STATUS: <strong className={`uppercase font-black ${run.status === 'completed' ? 'text-emerald-800' : 'text-[#F95738]'}`}>{run.status}</strong></span>
            <span>|</span>
            <span>TESTED AT: {new Date(run.created_at).toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3.5 py-2 bg-[#FFD000] hover:bg-[#ffe040] border-2 border-stone-900 rounded-lg text-stone-900 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#1C1917] flex items-center gap-2 disabled:opacity-50"
            title="Download full Markdown Security Audit Dossier"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            {exporting ? 'Exporting...' : 'Export Dossier (.md)'}
          </button>

          <button
            onClick={loadData}
            className="p-2 bg-white border-2 border-stone-900 rounded-lg hover:bg-stone-200 text-stone-900 font-bold transition-colors cursor-pointer shadow-[2px_2px_0px_#1C1917]"
            title="Refresh Telemetry Data"
          >
            <RefreshCw className={`w-4 h-4 ${run?.status === 'running' ? 'animate-spin text-[#F95738]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Score Gauge summary card */}
      <ScoreSummaryCard run={run} summary={summary} />

      {/* 2. AUTOMATED DEFENSIVE REMEDIATION: AUTO-PATCH GUARDRAILS */}
      <AutoPatchGuardrailCard run={run} summary={summary} onRunStarted={onRunStarted} />

      {/* 3. NEURAL SCAN TELEMETRY HUD */}
      <NeuralScanVisualizer summary={summary} run={run} />

      {/* 3. Recharts Strategy Comparison & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrategyComparisonChart summary={summary} />

        <div className="p-6 border-2 border-stone-900 rounded-xl bg-[#FAF6EE] shadow-[6px_6px_0px_#1C1917]">
          <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-stone-900">
            <Activity className="w-4 h-4 text-[#F95738]" />
            Category Pass / Fail Breakdown
          </h3>
          <div className="h-64 w-full" style={{ minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={260}>
              <BarChart data={categoryChartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                <XAxis dataKey="category" stroke="#1C1917" tick={{ fill: '#1C1917', fontSize: 11, fontFamily: 'Courier New', fontWeight: 'bold' }} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#1C1917" tick={{ fill: '#1C1917', fontSize: 11, fontFamily: 'Courier New', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FAF6EE', borderColor: '#1C1917', borderWidth: '2px', borderRadius: '4px', color: '#1C1917', fontFamily: 'Courier New', fontWeight: 'bold' }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Courier New', fontWeight: 'bold' }} />
                <Bar dataKey="passed" name="Robust (Pass)" fill="#10B981" radius={[2, 2, 0, 0]} stroke="#1C1917" strokeWidth={1.5} />
                <Bar dataKey="failed" name="Vulnerable (Fail)" fill="#F95738" radius={[2, 2, 0, 0]} stroke="#1C1917" strokeWidth={1.5} />
                <Bar dataKey="ambiguous" name="Ambiguous" fill="#FFD000" radius={[2, 2, 0, 0]} stroke="#1C1917" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Detailed Evaluation Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#F95738]" />
            Adversarial Probes & Attack Inspection Log
          </h3>
          <span className="text-[10px] text-stone-700 font-bold">CLICK ANY ROW TO EXPAND DETAILED PROMPT & RESPONSE</span>
        </div>
        <ResultsTable results={run.results} />
      </div>
    </div>
  );
}
