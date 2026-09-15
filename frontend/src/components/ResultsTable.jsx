import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import RedactedText from './RedactedText';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, HelpCircle, Shield, Cpu } from 'lucide-react';

export default function ResultsTable({ results }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center text-stone-600 border-2 border-stone-900 rounded-xl bg-[#FAF6EE] font-mono font-bold">
        No evaluation logs available. Submit a target run to inspect adversarial results.
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="border-2 border-stone-900 rounded-xl overflow-hidden bg-[#FAF6EE] font-mono shadow-[4px_4px_0px_#1C1917]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FFD000] text-stone-950 border-b-2 border-stone-900 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Test Case ID</th>
              <th className="py-3 px-4">Strategy</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Break Turn</th>
              <th className="py-3 px-4">Explanation</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-stone-900">
            {results.map((res) => {
              const isVulnerable = res.label === 'vulnerable';
              const isRobust = res.label === 'robust';
              const isOffensive = res.is_offensive_content === 1;

              return (
                <React.Fragment key={res.id}>
                  <tr 
                    onClick={() => toggleExpand(res.id)}
                    className="hover:bg-amber-100 cursor-pointer transition-colors font-bold text-stone-900"
                  >
                    <td className="py-3 px-4">
                      {isRobust && (
                        <span className="flex items-center gap-1 text-emerald-800 font-black">
                          <CheckCircle className="w-4 h-4 text-emerald-700" />
                          <span>PASS</span>
                        </span>
                      )}
                      {isVulnerable && (
                        <span className="flex items-center gap-1 text-[#F95738] font-black">
                          <AlertTriangle className="w-4 h-4 text-[#F95738]" />
                          <span>FAIL</span>
                        </span>
                      )}
                      {!isRobust && !isVulnerable && (
                        <span className="flex items-center gap-1 text-amber-900 font-black">
                          <HelpCircle className="w-4 h-4 text-amber-700" />
                          <span>AMBIG</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-stone-950">
                      {res.test_case_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-stone-900 text-white border border-stone-900 px-2 py-0.5 rounded font-bold">
                        {res.strategy || 'seed_benchmark'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-800">
                      {res.test_case?.category || 'general'}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={res.severity} />
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      {res.broke_at_turn ? (
                        <span className="text-[#F95738] font-black">Turn #{res.broke_at_turn}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-800 max-w-xs truncate">
                      {res.explanation || 'No explanation'}
                    </td>
                    <td className="py-3 px-4 text-right text-stone-900">
                      {expandedId === res.id ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                    </td>
                  </tr>

                  {expandedId === res.id && (
                    <tr className="bg-[#EFE6D5]">
                      <td colSpan={8} className="p-4 border-t-2 border-b-2 border-stone-900">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black uppercase text-stone-900 tracking-wider flex items-center gap-2">
                              <Cpu className="w-3.5 h-3.5 text-[#F95738]" />
                              Adversarial Input Prompt / Turns:
                            </span>
                            <pre className="mt-1.5 p-3 bg-white border-2 border-stone-900 rounded-lg text-xs text-stone-900 whitespace-pre-wrap font-mono font-bold shadow-[2px_2px_0px_#1C1917]">
                              {typeof res.test_case?.prompt_or_turns === 'string'
                                ? res.test_case.prompt_or_turns
                                : JSON.stringify(res.test_case?.prompt_or_turns, null, 2)}
                            </pre>
                          </div>

                          <div>
                            <span className="text-[10px] font-black uppercase text-stone-900 tracking-wider flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5 text-stone-900" />
                              Target Output Response (Classified Telemetry Mode):
                            </span>
                            <div className="mt-1.5 p-3 bg-white border-2 border-stone-900 rounded-lg text-xs text-stone-900 font-bold shadow-[2px_2px_0px_#1C1917]">
                              <RedactedText text={res.response_text || 'No output recorded.'} isOffensive={isOffensive} defaultRedacted={isVulnerable} />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-black uppercase text-stone-900 tracking-wider">
                              Evaluator Rationale & Judgment:
                            </span>
                            <p className="mt-1 text-xs text-stone-900 bg-white p-2.5 rounded-lg border-2 border-stone-900 font-bold shadow-[2px_2px_0px_#1C1917]">
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
