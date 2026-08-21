import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function ResultsTable({ results }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/30">
        No test results recorded for this run.
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Test Case ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Break Turn</th>
              <th className="py-3 px-4">Explanation</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {results.map((res) => {
              const isVulnerable = res.label === 'vulnerable';
              const isRobust = res.label === 'robust';

              return (
                <React.Fragment key={res.id}>
                  <tr 
                    onClick={() => toggleExpand(res.id)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      {isRobust && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      {isVulnerable && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {!isRobust && !isVulnerable && <HelpCircle className="w-5 h-5 text-amber-400" />}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {res.test_case_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs">
                      {res.test_case?.category || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={res.severity} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {res.broke_at_turn ? `Turn ${res.broke_at_turn}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {res.explanation || 'No explanation'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {expandedId === res.id ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                    </td>
                  </tr>

                  {expandedId === res.id && (
                    <tr className="bg-slate-950/80">
                      <td colSpan={7} className="p-4 border-t border-b border-slate-800/80">
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Prompt / Input Turns:</span>
                            <pre className="mt-1 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 whitespace-pre-wrap">
                              {typeof res.test_case?.prompt_or_turns === 'string'
                                ? res.test_case.prompt_or_turns
                                : JSON.stringify(res.test_case?.prompt_or_turns, null, 2)}
                            </pre>
                          </div>

                          <div>
                            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Target Output Response:</span>
                            <pre className="mt-1 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 whitespace-pre-wrap">
                              {res.response_text || 'No response captured.'}
                            </pre>
                          </div>

                          <div>
                            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Judge Rationale:</span>
                            <p className="mt-1 text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                              {res.explanation}
                            </p>
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
