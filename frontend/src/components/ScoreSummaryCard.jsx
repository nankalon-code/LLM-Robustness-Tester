import React from 'react';
import { ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

export default function ScoreSummaryCard({ run, summary }) {
  const score = run?.overall_score ?? summary?.overall_score ?? 100.0;
  
  const getScoreStyle = (s) => {
    if (s >= 85) return { color: 'text-emerald-800', bg: 'bg-emerald-100', label: 'HIGH ROBUSTNESS' };
    if (s >= 65) return { color: 'text-amber-900', bg: 'bg-amber-100', label: 'MODERATE RISK' };
    return { color: 'text-red-800', bg: 'bg-red-100', label: 'HIGH VULNERABILITY' };
  };

  const style = getScoreStyle(score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
      {/* Overall Score */}
      <div className={`p-5 rounded-xl border-2 border-stone-900 ${style.bg} relative overflow-hidden shadow-[4px_4px_0px_#1C1917]`}>
        <div className="flex items-center justify-between text-stone-900 text-xs font-black uppercase tracking-wider mb-1">
          <span>ROBUSTNESS SCORE</span>
          <Activity className="w-4 h-4 text-stone-900" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className={`text-4xl font-black ${style.color}`}>{score.toFixed(1)}</span>
          <span className="text-xs text-stone-700 font-bold">/ 100.0</span>
        </div>
        <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-900">
          STATUS: <span className={style.color}>{style.label}</span>
        </div>
      </div>

      <div className="p-5 rounded-xl border-2 border-stone-900 bg-[#FAF6EE] flex flex-col justify-between shadow-[4px_4px_0px_#1C1917]">
        <span className="text-xs font-black uppercase text-stone-900 tracking-wider">TOTAL TESTS EXECUTED</span>
        <div className="text-3xl font-black text-stone-900 mt-2">{summary?.total_tests || 0}</div>
        <div className="text-[10px] text-stone-600 font-bold mt-1">ALL STRATEGIES COMBINED</div>
      </div>

      <div className="p-5 rounded-xl border-2 border-stone-900 bg-[#FAF6EE] flex flex-col justify-between shadow-[4px_4px_0px_#1C1917]">
        <div className="flex items-center justify-between text-emerald-700 text-xs font-black uppercase tracking-wider">
          <span>ROBUST (PASS)</span>
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="text-3xl font-black text-emerald-800 mt-2">{summary?.passed_tests || 0}</div>
        <div className="text-[10px] text-emerald-700 font-bold mt-1">NO BREACH DETECTED</div>
      </div>

      <div className="p-5 rounded-xl border-2 border-stone-900 bg-[#FAF6EE] flex flex-col justify-between shadow-[4px_4px_0px_#1C1917]">
        <div className="flex items-center justify-between text-[#F95738] text-xs font-black uppercase tracking-wider">
          <span>VULNERABLE (FAIL)</span>
          <ShieldAlert className="w-4 h-4 text-[#F95738]" />
        </div>
        <div className="text-3xl font-black text-[#F95738] mt-2">{summary?.failed_tests || 0}</div>
        <div className="text-[10px] text-[#F95738] font-bold mt-1">SAFETY BREACHED</div>
      </div>
    </div>
  );
}
