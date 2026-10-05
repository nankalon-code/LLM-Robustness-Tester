import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import { 
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, HelpCircle, 
  Shield, Cpu, Filter, Eye, EyeOff, Terminal, Sparkles
} from 'lucide-react';

export default function ResultsTable({ results }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'vulnerable', 'robust'

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center text-stone-600 border-2 border-stone-900 rounded-xl bg-[#FAF6EE] font-mono font-bold shadow-[4px_4px_0px_#1C1917]">
        No evaluation logs available. Submit a target run to inspect adversarial test results.
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const vulnerableCount = results.filter((r) => r.label === 'vulnerable').length;
  const robustCount = results.filter((r) => r.label === 'robust').length;

  const filteredResults = results.filter((r) => {
    if (filter === 'vulnerable') return r.label === 'vulnerable';
    if (filter === 'robust') return r.label === 'robust';
    return true;
  });

  return (
    <div className="border-2 border-stone-900 rounded-xl overflow-hidden bg-[#FAF6EE] font-mono shadow-[5px_5px_0px_#1C1917]">
      {/* Table Filter Header */}
      <div className="bg-[#FFD000] border-b-2 border-stone-900 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-stone-950" />
          <span className="text-xs font-black uppercase text-stone-950">
            Adversarial Probes Audit Log ({results.length} Total Tests)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded border border-stone-900 transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white shadow-[1px_1px_0px_#1C1917]'
                : 'bg-white text-stone-900 hover:bg-stone-100'
            }`}
          >
            All Tests ({results.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('vulnerable')}
            className={`px-2.5 py-1 rounded border border-stone-900 transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'vulnerable'
                ? 'bg-[#F95738] text-white shadow-[1px_1px_0px_#1C1917]'
                : 'bg-white text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>Breached</span>
            <span className="bg-stone-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {vulnerableCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('robust')}
            className={`px-2.5 py-1 rounded border border-stone-900 transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'robust'
                ? 'bg-emerald-700 text-white shadow-[1px_1px_0px_#1C1917]'
                : 'bg-white text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>Defended</span>
            <span className="bg-stone-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {robustCount}
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF6EE] text-stone-900 border-b-2 border-stone-900 font-black uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Test Probe ID</th>
              <th className="py-3 px-4">Attack Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Risk Severity</th>
              <th className="py-3 px-4">Break Turn</th>
              <th className="py-3 px-4">Judge Summary</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-stone-900 bg-white">
            {filteredResults.map((res) => {
              const isVulnerable = res.label === 'vulnerable';
              const isRobust = res.label === 'robust';
              const isExpanded = expandedId === res.id;

              return (
                <React.Fragment key={res.id}>
                  <tr 
                    onClick={() => toggleExpand(res.id)}
                    className={`hover:bg-amber-50 cursor-pointer transition-colors font-bold text-stone-900 ${
                      isExpanded ? 'bg-amber-100/70' : ''
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isRobust && (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-black">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>BLOCKED</span>
                        </span>
                      )}
                      {isVulnerable && (
                        <span className="inline-flex items-center gap-1 text-[#F95738] bg-red-100 border border-[#F95738] px-2 py-0.5 rounded text-[11px] font-black">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#F95738]" />
                          <span>BREACHED</span>
                        </span>
                      )}
                      {!isRobust && !isVulnerable && (
                        <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100 border border-amber-800 px-2 py-0.5 rounded text-[11px] font-black">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>AMBIGUOUS</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-stone-950 font-mono">
                      {res.test_case_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded font-black uppercase">
                        {(res.strategy || 'mutation').replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-800 font-bold">
                      {(res.test_case?.category || 'adversarial').replaceAll('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={res.severity} />
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      {res.broke_at_turn ? (
                        <span className="text-[#F95738] font-black">Turn #{res.broke_at_turn}</span>
                      ) : (
                        <span className="text-stone-400 font-normal">Single-turn</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-800 max-w-xs truncate font-medium">
                      {res.explanation || 'Evaluated by LLM Judge'}
                    </td>
                    <td className="py-3 px-4 text-right text-stone-900 font-black">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] bg-stone-100 hover:bg-stone-200 border border-stone-900 px-2 py-1 rounded"
                      >
                        <span>{isExpanded ? 'Close' : 'View'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Inspection Drawer */}
                  {isExpanded && (
                    <tr className="bg-[#FAF6EE]">
                      <td colSpan={8} className="p-5 border-t-2 border-b-2 border-stone-900">
                        <div className="space-y-4">
                          {/* Attack Injected */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                                <Cpu className="w-4 h-4 text-[#F95738]" />
                                1. Adversarial Attack Injected by Red Team Engine:
                              </span>
                              <span className="text-[10px] text-stone-600 font-bold">
                                Category: {(res.test_case?.category || 'adversarial').replaceAll('_', ' ')}
                              </span>
                            </div>
                            <div className="p-3.5 bg-white border-2 border-stone-900 rounded-lg text-xs text-stone-900 whitespace-pre-wrap font-mono font-bold shadow-[2px_2px_0px_#1C1917]">
                              {typeof res.test_case?.prompt_or_turns === 'string'
                                ? res.test_case.prompt_or_turns
                                : JSON.stringify(res.test_case?.prompt_or_turns, null, 2)}
                            </div>
                          </div>

                          {/* Bot's Actual Output */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-stone-900" />
                                2. Bot's Actual Response:
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-stone-900 ${
                                isVulnerable ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isVulnerable ? '⚠️ COMPLIED WITH ATTACK' : '✅ SAFELY REFUSED'}
                              </span>
                            </div>
                            <div className={`p-3.5 rounded-lg border-2 border-stone-900 text-xs font-mono font-bold shadow-[2px_2px_0px_#1C1917] ${
                              isVulnerable ? 'bg-red-50 text-red-950' : 'bg-emerald-50 text-emerald-950'
                            }`}>
                              {res.response_text || 'No response recorded.'}
                            </div>
                          </div>

                          {/* Judge's Rationale */}
                          <div>
                            <span className="text-[11px] font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5 mb-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              3. AI Judge's Safety Analysis & Verdict:
                            </span>
                            <div className="p-3 bg-amber-50 rounded-lg border-2 border-stone-900 text-xs text-stone-900 font-bold shadow-[2px_2px_0px_#1C1917]">
                              {res.explanation || 'No rationale recorded.'}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
