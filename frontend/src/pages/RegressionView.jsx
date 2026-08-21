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
    <div className="space-y-6">
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyber-amber/10 rounded-xl border border-cyber-amber/30 text-cyber-amber">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Regression & Diff Analysis</h2>
            <p className="text-sm text-slate-400">Compare baseline security evaluation against candidate runs to detect regressions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Baseline Run (Run A)</label>
            <select
              value={runAId}
              onChange={(e) => setRunAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyber-cyan"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Candidate Run (Run B)</label>
            <select
              value={runBId}
              onChange={(e) => setRunBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-cyber-cyan"
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
            className="w-full bg-cyber-cyan text-slate-950 font-bold py-3 px-6 rounded-xl hover:bg-cyber-cyan/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Computing Diff...' : 'Compute Regression Diff'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {diff && (
        <div className="space-y-6">
          {/* Summary Delta Card */}
          <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Score Delta</span>
              <div className={`text-3xl font-extrabold mt-1 ${diff.score_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {diff.score_change >= 0 ? `+${diff.score_change}` : diff.score_change} pts
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">New Regressions</span>
              <div className="text-3xl font-extrabold text-red-400 mt-1">{diff.new_vulnerabilities.length}</div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Remediated / Fixed</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{diff.fixed_vulnerabilities.length}</div>
            </div>
          </div>

          {/* New Vulnerabilities (Regressions) */}
          {diff.new_vulnerabilities.length > 0 && (
            <div className="border border-red-500/30 rounded-2xl bg-red-500/5 p-6">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5" />
                <span>New Security Regressions Introduced</span>
              </h3>
              <div className="space-y-3">
                {diff.new_vulnerabilities.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono font-bold text-slate-200">{item.test_case_id}</span>
                      <span className="ml-3 text-xs text-slate-400 font-mono">[{item.category}]</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">Severity:</span>
                      <SeverityBadge severity={item.run_b_severity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Vulnerabilities */}
          {diff.fixed_vulnerabilities.length > 0 && (
            <div className="border border-emerald-500/30 rounded-2xl bg-emerald-500/5 p-6">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5" />
                <span>Remediated Vulnerabilities</span>
              </h3>
              <div className="space-y-3">
                {diff.fixed_vulnerabilities.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono font-bold text-slate-200">{item.test_case_id}</span>
                      <span className="ml-3 text-xs text-slate-400 font-mono">[{item.category}]</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase">Fixed</span>
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
