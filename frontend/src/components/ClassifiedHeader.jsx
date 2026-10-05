import React from 'react';
import { Shield, Play, BarChart3, GitCompare, BookOpen, Terminal, CheckCircle2, Zap } from 'lucide-react';

export default function ClassifiedHeader({ activeTab, setActiveTab, onOpenPowershell }) {
  return (
    <header className="border-b-2 border-stone-900 bg-[#FAF6EE] sticky top-0 z-40 font-mono shadow-sm">
      {/* Top Bright Yellow Accent Bar */}
      <div className="bg-[#FFD000] border-b-2 border-stone-900 px-6 py-2.5 flex flex-wrap items-center justify-between text-stone-950 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 border border-stone-900 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider font-mono text-stone-900">
                LLM ROBUSTNESS & SAFETY TESTER
              </span>
              <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded-sm font-bold">
                PEREZ ET AL. (2022)
              </span>
            </div>
          </div>
        </div>

        {/* Status & Powershell Terminal Pop-up Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-stone-900 px-2.5 py-1 rounded text-[11px] font-black text-stone-900 shadow-[1px_1px_0px_#1C1917]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ENGINE: QWEN 2.5 3B (OLLAMA LOCAL)</span>
          </div>

          <button
            onClick={onOpenPowershell}
            className="flex items-center gap-2 bg-[#012456] text-white px-3.5 py-1.5 rounded border-2 border-stone-900 font-bold text-xs shadow-[2px_2px_0px_#1C1917] hover:bg-blue-900 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>POWERSHELL CLI</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
          <span className="bg-[#F95738] text-white px-2 py-0.5 border border-stone-900 font-extrabold text-[10px]">
            AI RED TEAMING
          </span>
          <span className="hidden sm:inline">Automated Adversarial Security Suite</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all border-2 border-stone-900 cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-[#F95738] text-white shadow-[2px_2px_0px_#1C1917]'
                : 'bg-[#FAF6EE] text-stone-800 hover:bg-stone-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>1-Click Test</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all border-2 border-stone-900 cursor-pointer ${
              activeTab === 'results'
                ? 'bg-[#F95738] text-white shadow-[2px_2px_0px_#1C1917]'
                : 'bg-[#FAF6EE] text-stone-800 hover:bg-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Safety Report & Score</span>
          </button>

          <button
            onClick={() => setActiveTab('regression')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all border-2 border-stone-900 cursor-pointer ${
              activeTab === 'regression'
                ? 'bg-[#F95738] text-white shadow-[2px_2px_0px_#1C1917]'
                : 'bg-[#FAF6EE] text-stone-800 hover:bg-stone-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Before vs After Diff</span>
          </button>

          <button
            onClick={() => setActiveTab('paperspecs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all border-2 border-stone-900 cursor-pointer ${
              activeTab === 'paperspecs'
                ? 'bg-[#F95738] text-white shadow-[2px_2px_0px_#1C1917]'
                : 'bg-[#FAF6EE] text-stone-800 hover:bg-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research Specs</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
