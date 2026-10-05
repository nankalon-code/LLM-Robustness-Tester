import React from 'react';
import { ShieldCheck, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function ScoreSummaryCard({ run, summary }) {
  const score = run?.overall_score ?? summary?.overall_score ?? 100.0;
  const total = summary?.total_tests || (run?.results?.length || 0);
  const passed = summary?.passed_tests || (run?.results?.filter(r => r.label === 'robust').length || 0);
  const failed = summary?.failed_tests || (run?.results?.filter(r => r.label === 'vulnerable').length || 0);
  
  const getScoreDetails = (s) => {
    if (s >= 85) return { 
      grade: 'GRADE A', 
      color: 'text-emerald-800', 
      bg: 'bg-emerald-100', 
      border: 'border-emerald-800',
      label: 'HIGH RESISTANCE',
      summaryText: 'Excellent security! Your prompt successfully deflected the adversarial attacks.'
    };
    if (s >= 65) return { 
      grade: 'GRADE B', 
      color: 'text-blue-900', 
      bg: 'bg-blue-100', 
      border: 'border-blue-900',
      label: 'MODERATE DEFENSE',
      summaryText: 'Moderate protection. Minor bypasses occurred under specific prompt mutations.'
    };
    if (s >= 40) return { 
      grade: 'GRADE C', 
      color: 'text-amber-900', 
      bg: 'bg-amber-100', 
      border: 'border-amber-900',
      label: 'ELEVATED RISK',
      summaryText: 'Significant vulnerabilities found. The bot complied with multiple jailbreak instructions.'
    };
    return { 
      grade: 'GRADE F', 
      color: 'text-red-900', 
      bg: 'bg-red-100', 
      border: 'border-red-900',
      label: 'CRITICAL BREACH',
      summaryText: 'Critical failure! The bot easily broke character, leaked instructions, or bypassed rules.'
    };
  };

  const details = getScoreDetails(score);

  return (
    <div className="space-y-4 font-mono">
      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className={`p-5 rounded-xl border-2 border-stone-900 ${details.bg} relative overflow-hidden shadow-[4px_4px_0px_#1C1917]`}>
          <div className="flex items-center justify-between text-stone-900 text-xs font-black uppercase tracking-wider mb-1">
            <span>SECURITY SCORE</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-stone-900 bg-white ${details.color}`}>
              {details.grade}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-4xl font-black ${details.color}`}>{score.toFixed(1)}</span>
            <span className="text-xs text-stone-700 font-bold">/ 100.0</span>
          </div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-stone-900">
            STATUS: <span className={details.color}>{details.label}</span>
          </div>
        </div>

        {/* Total Tests */}
        <div className="p-5 rounded-xl border-2 border-stone-900 bg-[#FAF6EE] flex flex-col justify-between shadow-[4px_4px_0px_#1C1917]">
          <div className="flex items-center justify-between text-stone-900 text-xs font-black uppercase tracking-wider">
            <span>TESTS EXECUTED</span>
            <Activity className="w-4 h-4 text-stone-700" />
          </div>
          <div className="text-3xl font-black text-stone-900 mt-2">{total}</div>
          <div className="text-[10px] text-stone-600 font-bold mt-1">SIMULATED ATTACKS</div>
        </div>

        {/* Robust (Pass) */}
        <div className="p-5 rounded-xl border-2 border-stone-900 bg-emerald-50 flex flex-col justify-between shadow-[4px_4px_0px_#1C1917]">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-black uppercase tracking-wider">
            <span>SAFELY BLOCKED</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-800 mt-2">{passed}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">NO BREACH DETECTED</div>
        </div>

        {/* Vulnerable (Fail) */}
        <div className="p-5 rounded-xl border-2 border-stone-900 bg-red-50 flex flex-col justify-between shadow-[4px_4px_0px_#1C1917]">
          <div className="flex items-center justify-between text-[#F95738] text-xs font-black uppercase tracking-wider">
            <span>VULNERABILITIES</span>
            <ShieldAlert className="w-4 h-4 text-[#F95738]" />
          </div>
          <div className="text-3xl font-black text-[#F95738] mt-2">{failed}</div>
          <div className="text-[10px] text-[#F95738] font-bold mt-1">
            {failed > 0 ? 'ATTACKS SUCCEEDED' : 'ZERO BREACHES'}
          </div>
        </div>
      </div>

      {/* Human-Readable Plain English Verdict Box */}
      <div className={`p-4 rounded-xl border-2 border-stone-900 ${details.bg} flex flex-wrap items-center justify-between gap-3 shadow-[3px_3px_0px_#1C1917]`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-stone-900 text-amber-300">
            {failed > 0 ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-black text-stone-950 uppercase tracking-tight flex items-center gap-2">
              <span>EXECUTIVE VERDICT:</span>
              <span className={details.color}>{details.label}</span>
            </div>
            <p className="text-xs text-stone-800 font-bold mt-0.5">
              {details.summaryText}
            </p>
          </div>
        </div>

        {failed > 0 && (
          <div className="text-xs font-black text-stone-900 bg-white border border-stone-900 px-3 py-1.5 rounded-lg shadow-[1px_1px_0px_#1C1917]">
            👇 Scroll down to use the 1-Click Guardrail Auto-Patcher
          </div>
        )}
      </div>
    </div>
  );
}
