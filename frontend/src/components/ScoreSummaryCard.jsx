import React from 'react';

export default function ScoreSummaryCard({ run, summary }) {
  const score = run?.overall_score ?? summary?.overall_score ?? 100.0;
  
  const getScoreColor = (s) => {
    if (s >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (s >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-red-400 border-red-500/30 bg-red-500/5';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className={`p-5 rounded-xl border ${getScoreColor(score)}`}>
        <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Robustness Score</span>
        <div className="text-3xl font-extrabold mt-1">{score.toFixed(1)} <span className="text-lg text-slate-400 font-normal">/ 100</span></div>
      </div>

      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Evaluated</span>
        <div className="text-3xl font-extrabold text-slate-100 mt-1">{summary?.total_tests || 0}</div>
      </div>

      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Passed (Robust)</span>
        <div className="text-3xl font-extrabold text-emerald-400 mt-1">{summary?.passed_tests || 0}</div>
      </div>

      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Failed (Vulnerable)</span>
        <div className="text-3xl font-extrabold text-red-400 mt-1">{summary?.failed_tests || 0}</div>
      </div>
    </div>
  );
}
