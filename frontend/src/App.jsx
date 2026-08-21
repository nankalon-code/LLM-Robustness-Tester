import React, { useState, useEffect } from 'react';
import SubmitTarget from './pages/SubmitTarget';
import RunResults from './pages/RunResults';
import RegressionView from './pages/RegressionView';
import { fetchTestRuns } from './api/client';
import { Shield, Play, BarChart3, GitCompare, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [currentRunId, setCurrentRunId] = useState(null);
  const [runs, setRuns] = useState([]);

  const loadRuns = async () => {
    try {
      const data = await fetchTestRuns();
      setRuns(data);
      if (data.length > 0 && !currentRunId) {
        setCurrentRunId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleRunStarted = (runId) => {
    setCurrentRunId(runId);
    loadRuns();
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyber-cyan/20">
              <Shield className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
                LLM Robustness Tester
                <span className="text-[10px] font-mono uppercase bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded-full">
                  Local-First
                </span>
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-cyber-cyan text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>New Test Target</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'results'
                  ? 'bg-cyber-cyan text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Run Results</span>
            </button>

            <button
              onClick={() => setActiveTab('regression')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'regression'
                  ? 'bg-cyber-cyan text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Regression Diff</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'submit' && (
          <SubmitTarget onRunStarted={handleRunStarted} />
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Run Selector Bar */}
            {runs.length > 0 && (
              <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Select Evaluation Run:</span>
                <select
                  value={currentRunId || ''}
                  onChange={(e) => setCurrentRunId(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan font-mono"
                >
                  {runs.map((r) => (
                    <option key={r.id} value={r.id}>
                      Run #{r.id} - {r.target_info?.name || 'Target'} ({new Date(r.created_at).toLocaleTimeString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <RunResults runId={currentRunId} />
          </div>
        )}

        {activeTab === 'regression' && (
          <RegressionView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500">
        LLM Robustness Tester &copy; 2026 — Local-first Security & Alignment Benchmarking Suite
      </footer>
    </div>
  );
}
