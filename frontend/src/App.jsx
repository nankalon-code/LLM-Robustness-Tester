import React, { useState, useEffect } from 'react';
import ClassifiedHeader from './components/ClassifiedHeader';
import SubmitTarget from './pages/SubmitTarget';
import RunResults from './pages/RunResults';
import RegressionView from './pages/RegressionView';
import PaperSpecsView from './pages/PaperSpecsView';
import PowershellTerminalModal from './components/PowershellTerminalModal';
import { fetchTestRuns } from './api/client';
import { Radio, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [currentRunId, setCurrentRunId] = useState(null);
  const [runs, setRuns] = useState([]);
  const [isPowershellOpen, setIsPowershellOpen] = useState(false);

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
    <div className="min-h-screen bg-[#EFE6D5] text-[#1C1917] flex flex-col font-mono parchment-bg">
      {/* Vintage Classified Header */}
      <ClassifiedHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPowershell={() => setIsPowershellOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'submit' && (
          <SubmitTarget onRunStarted={handleRunStarted} />
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Run Selector Bar */}
            {runs.length > 0 && (
              <div className="flex flex-wrap items-center justify-between bg-[#FAF6EE] p-4 border-2 border-stone-900 rounded-xl shadow-[4px_4px_0px_#1C1917]">
                <div className="flex items-center gap-2 text-stone-900 font-black text-xs">
                  <Radio className="w-4 h-4 text-[#F95738]" />
                  <span>SELECT EVALUATION TELEMETRY DOSSIER:</span>
                </div>
                <select
                  value={currentRunId || ''}
                  onChange={(e) => setCurrentRunId(Number(e.target.value))}
                  className="bg-white border-2 border-stone-900 rounded-lg px-4 py-2 text-xs font-black text-stone-900 focus:outline-none font-mono cursor-pointer shadow-[2px_2px_0px_#1C1917]"
                >
                  {runs.map((r) => (
                    <option key={r.id} value={r.id}>
                      Run #{r.id} - {r.target_info?.name || 'Target'} ({new Date(r.created_at).toLocaleTimeString()}) - Strategy: {r.selected_strategy || 'all'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <RunResults runId={currentRunId} onRunStarted={handleRunStarted} />
          </div>
        )}

        {activeTab === 'regression' && (
          <RegressionView />
        )}

        {activeTab === 'paperspecs' && (
          <PaperSpecsView />
        )}
      </main>

      {/* PowerShell Pop-Up Modal */}
      <PowershellTerminalModal
        isOpen={isPowershellOpen}
        onClose={() => setIsPowershellOpen(false)}
      />

      {/* Vintage Footer */}
      <footer className="border-t-2 border-stone-900 bg-[#FFD000] py-4 px-6 text-[#1C1917] font-mono text-xs flex flex-wrap items-center justify-between max-w-7xl mx-auto w-full font-bold">
        <div>
          LLM RED TEAMING DOSSIER &copy; 2026 — Ethan Perez et al. (DeepMind / NYU) Implementation Suite
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPowershellOpen(true)}
            className="flex items-center gap-1.5 bg-[#012456] text-white px-2.5 py-1 rounded border border-stone-900 text-[11px] font-black cursor-pointer shadow-[2px_2px_0px_#1C1917]"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>POWERSHELL CLI</span>
          </button>
          <span className="text-[10px]">CLASSIFICATION: TOP SECRET</span>
          <span className="text-[10px]">SYSTEM ID: #00762</span>
        </div>
      </footer>
    </div>
  );
}
