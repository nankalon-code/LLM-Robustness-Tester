import React, { useState, useEffect } from 'react';
import { fetchTestRuns, fetchRegressionDiff } from '../api/client';
import SeverityBadge from '../components/SeverityBadge';
import { GitCompare, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function RegressionView() {
  const [runs, setRuns] = useState([]);
  const [runAId, setRunAId] = useState('');
  const [runBId, setRunBId] = useState('');
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTestRuns().then((data) => {
      setRuns(data);
      if (data.length >= 2) {
        setRunAId(data[data.length - 1].id.toString());
        setRunBId(data[0].id.toString());
      } else if (data.length === 1) {
        setRunAId(data[0].id.toString());
        setRunBId(data[0].id.toString());
      }
    });
  }, []);

  const handleCompare = async () => {
    if (!runAId || !runBId) return;
    setLoading(true);
    try {
      const data = await fetchRegressionDiff(runAId, runBId);
      setDiff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-6 md:p-8 relative overflow-hidden shadow-[6px_6px_0px_#1C1917]">
        <div className="flex items-center gap-3 mb-6 border-b-2 border-stone-900 pb-4">
          <div className="p-3 bg-[#FFD000] border-2 border-stone-900 text-stone-900 rounded font-bold">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-stone-900 uppercase tracking-wider">REGRESSION & SECURITY DIFF MATRIX</h2>
              <span className="stamp-classified text-[9px]">COMPARATIVE TELEMETRY</span>
            </div>
            <p className="text-xs text-stone-700 font-bold">Perez et al. Baseline vs Candidate Model Security Drift Tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-2">BASELINE RUN (RUN A)</label>
            <select
              value={runAId}
              onChange={(e) => setRunAId(e.target.value)}
              className="w-full bg-white border-2 border-stone-900 rounded-lg px-4 py-3 text-stone-900 text-xs font-bold focus:outline-none shadow-[2px_2px_0px_#1C1917]"
            >
              <option value="">Select Baseline Run</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  Run #{r.id} - {r.target_info?.name || 'Target'} ({r.overall_score ?? 'N/A'} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-2">CANDIDATE RUN (RUN B)</label>
            <select
              value={runBId}
              onChange={(e) => setRunBId(e.target.value)}
              className="w-full bg-white border-2 border-stone-900 rounded-lg px-4 py-3 text-stone-900 text-xs font-bold focus:outline-none shadow-[2px_2px_0px_#1C1917]"
            >
              <option value="">Select Candidate Run</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  Run #{r.id} - {r.target_info?.name || 'Target'} ({r.overall_score ?? 'N/A'} pts)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!runAId || !runBId || loading}
            className="w-full bg-[#F95738] text-white border-2 border-stone-900 font-black py-3.5 px-6 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider shadow-[4px_4px_0px_#1C1917]"
          >
            <span>{loading ? 'COMPUTING DIFF...' : 'COMPUTE REGRESSION DIFF'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {diff && (
        <div className="space-y-6">
          {/* Summary Delta Card */}
          <div className="p-6 border-2 border-stone-900 rounded-xl bg-[#FAF6EE] grid grid-cols-1 md:grid-cols-3 gap-6 shadow-[6px_6px_0px_#1C1917]">
            <div className="bg-white p-4 border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#1C1917]">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900">SCORE DELTA</span>
              <div className={`text-3xl font-black mt-1 ${diff.score_change >= 0 ? 'text-emerald-800' : 'text-[#F95738]'}`}>
                {diff.score_change >= 0 ? `+${diff.score_change}` : diff.score_change} pts
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#1C1917]">
              <span className="text-xs font-black uppercase tracking-wider text-[#F95738]">NEW REGRESSIONS</span>
              <div className="text-3xl font-black text-[#F95738] mt-1">{diff.new_vulnerabilities.length}</div>
            </div>
            <div className="bg-white p-4 border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#1C1917]">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">REMEDIATED / FIXED</span>
              <div className="text-3xl font-black text-emerald-800 mt-1">{diff.fixed_vulnerabilities.length}</div>
            </div>
          </div>

          {/* New Vulnerabilities (Regressions) */}
          {diff.new_vulnerabilities.length > 0 && (
            <div className="border-2 border-stone-900 rounded-xl bg-red-100 p-6 shadow-[6px_6px_0px_#1C1917]">
              <h3 className="text-sm font-black text-[#F95738] flex items-center gap-2 mb-4 uppercase tracking-wider">
                <ShieldAlert className="w-5 h-5" />
                <span>NEW SECURITY REGRESSIONS INTRODUCED</span>
              </h3>
              <div className="space-y-3">
                {diff.new_vulnerabilities.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border-2 border-stone-900 rounded-lg flex items-center justify-between text-xs font-bold shadow-[2px_2px_0px_#1C1917]">
                    <div>
                      <span className="font-black text-stone-950">{item.test_case_id}</span>
                      <span className="ml-3 text-stone-700">[{item.category}]</span>
                      <span className="ml-2 text-[10px] bg-[#FFD000] text-stone-950 border border-stone-900 px-1.5 py-0.5 rounded font-black">
                        {item.strategy || 'seed_benchmark'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-stone-700">Severity:</span>
                      <SeverityBadge severity={item.run_b_severity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Vulnerabilities */}
          {diff.fixed_vulnerabilities.length > 0 && (
            <div className="border-2 border-stone-900 rounded-xl bg-emerald-100 p-6 shadow-[6px_6px_0px_#1C1917]">
              <h3 className="text-sm font-black text-emerald-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <span>REMEDIATED VULNERABILITIES</span>
              </h3>
              <div className="space-y-3">
                {diff.fixed_vulnerabilities.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border-2 border-stone-900 rounded-lg flex items-center justify-between text-xs font-bold shadow-[2px_2px_0px_#1C1917]">
                    <div>
                      <span className="font-black text-stone-950">{item.test_case_id}</span>
                      <span className="ml-3 text-stone-700">[{item.category}]</span>
                    </div>
                    <span className="font-black text-emerald-800 uppercase">REMEDIATED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
