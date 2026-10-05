import React, { useState } from 'react';
import { autoPatchGuardrails, createTestRun, verifyPatch } from '../api/client';
import { ShieldCheck, ShieldAlert, Sparkles, RefreshCw, ArrowRight, CheckCircle2, Copy, Check, FileText, Zap } from 'lucide-react';

export default function AutoPatchGuardrailCard({ run, summary, onRunStarted }) {
  const [loading, setLoading] = useState(false);
  const [remediation, setRemediation] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [retesting, setRetesting] = useState(false);

  const failedCount = summary?.failed_tests || 0;
  const isVulnerable = failedCount > 0;

  const handleSynthesize = async () => {
    if (!run?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await autoPatchGuardrails(run.id);
      setRemediation(data);
    } catch (err) {
      setError(err.message || 'Failed to synthesize hardened guardrails');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPatch = async () => {
    if (!run?.id) return;
    setRetesting(true);
    setError(null);
    try {
      const data = await verifyPatch(run.id);
      if (onRunStarted && data.verification_run_id) {
        onRunStarted(data.verification_run_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to trigger verification benchmark');
    } finally {
      setRetesting(false);
    }
  };

  const handleCopyPrompt = () => {
    if (remediation?.hardened_prompt) {
      navigator.clipboard.writeText(remediation.hardened_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRunHardenedBenchmark = async () => {
    if (!remediation?.hardened_target_id) return;
    setRetesting(true);
    setError(null);
    try {
      const newRun = await createTestRun({
        target_id: remediation.hardened_target_id,
        selected_strategy: run.selected_strategy || 'all_perez_strategies',
        red_team_generator_model: run.red_team_generator_model || 'qwen:qwen2.5:3b',
        target_info: {
          id: remediation.hardened_target_id,
          name: remediation.hardened_name,
          target_type: 'system_prompt',
          content: remediation.hardened_prompt
        }
      });
      if (onRunStarted) {
        onRunStarted(newRun.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to launch benchmark on hardened prompt');
    } finally {
      setRetesting(false);
    }
  };

  return (
    <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-6 font-mono shadow-[6px_6px_0px_#1C1917] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-stone-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFD000] border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#1C1917]">
            <ShieldCheck className="w-6 h-6 text-stone-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                DEFENSIVE REMEDIATION ENGINE: AUTO-PATCH GUARDRAILS
              </h3>
              <span className="stamp-specimen text-[9px]">DEFENSE PROTOCOL</span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Perez et al. Closed-Loop Optimization — Attack → Diagnose → Auto-Patch → Verify
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVulnerable ? (
            <span className="px-3 py-1 bg-[#F95738] text-white border-2 border-stone-900 text-xs font-black rounded shadow-[2px_2px_0px_#1C1917] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              {failedCount} BREACHES DETECTED
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-600 text-white border-2 border-stone-900 text-xs font-black rounded shadow-[2px_2px_0px_#1C1917] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              0 BREACHES (SYSTEM ROBUST)
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#F95738] text-white border-2 border-stone-900 rounded-lg text-xs font-bold shadow-[2px_2px_0px_#1C1917]">
          {error}
        </div>
      )}

      {/* Main Body */}
      {!remediation ? (
        <div className="bg-white border-2 border-stone-900 rounded-xl p-6 shadow-[3px_3px_0px_#1C1917] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD000] fill-[#FFD000]" />
              Synthesize Hardened System Prompt v2
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed font-bold">
              Automated defense synthesizer analyzes every failed test case in Run #{run?.id}, extracts the exploit vectors (roleplay bypasses, prompt leaks, delimiter injections), and generates tailored mathematical guardrail clauses while preserving target persona and utility.
            </p>
          </div>

          <button
            onClick={handleSynthesize}
            disabled={loading}
            className="px-6 py-3.5 bg-[#FFD000] hover:bg-[#ffe040] text-stone-900 border-2 border-stone-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_#1C1917] flex items-center gap-2 shrink-0 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-900" />
                Synthesizing Guardrails...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-stone-900" />
                Auto-Patch Guardrails
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Remediation Summary Banner */}
          <div className="p-4 bg-[#FFD000] border-2 border-stone-900 rounded-xl shadow-[3px_3px_0px_#1C1917] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-900">STATUS: REMEDIATION SYNTHESIZED</span>
              <p className="text-xs font-black text-stone-900 mt-0.5">
                {remediation.patch_summary}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 bg-white border-2 border-stone-900 text-stone-900 text-xs font-bold rounded hover:bg-stone-100 flex items-center gap-1.5 shadow-[2px_2px_0px_#1C1917] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Prompt' : 'Copy Prompt v2'}
              </button>
              <button
                onClick={handleVerifyPatch}
                disabled={retesting}
                className="px-3.5 py-1.5 bg-[#FFD000] hover:bg-[#ffe040] text-stone-900 border-2 border-stone-900 text-xs font-black uppercase rounded flex items-center gap-1.5 shadow-[2px_2px_0px_#1C1917] cursor-pointer disabled:opacity-50"
                title="Immediately run verification benchmark to prove vulnerabilities are mitigated"
              >
                {retesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-900" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-stone-900 fill-stone-900" />
                )}
                {retesting ? 'Verifying...' : '⚡ 1-Click Verify Patch'}
              </button>
              <button
                onClick={handleRunHardenedBenchmark}
                disabled={retesting}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-stone-900 text-xs font-black uppercase rounded flex items-center gap-1.5 shadow-[2px_2px_0px_#1C1917] cursor-pointer disabled:opacity-50"
              >
                {retesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                {retesting ? 'Launching...' : 'Run Full Suite on v2'}
              </button>
            </div>
          </div>

          {/* Prompt Comparison Before vs After */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Prompt */}
            <div className="bg-white border-2 border-stone-900 rounded-xl p-4 shadow-[2px_2px_0px_#1C1917] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b-2 border-stone-900">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#F95738] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ORIGINAL PROMPT (VULNERABLE)
                </span>
                <span className="text-[9px] font-bold bg-stone-100 px-2 py-0.5 border border-stone-900 rounded">SPECIMEN #{remediation.original_target_id || run?.target_id}</span>
              </div>
              <pre className="text-xs text-stone-800 bg-[#FAF6EE] p-3 rounded border border-stone-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {remediation.original_prompt}
              </pre>
            </div>

            {/* Hardened Prompt v2 */}
            <div className="bg-white border-2 border-stone-900 rounded-xl p-4 shadow-[2px_2px_0px_#1C1917] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b-2 border-stone-900">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  HARDENED PROMPT V2 (DEFENSES ACTIVE)
                </span>
                <span className="text-[9px] font-bold bg-[#FFD000] px-2 py-0.5 border border-stone-900 rounded">SAVED AS SPECIMEN #{remediation.hardened_target_id}</span>
              </div>
              <pre className="text-xs text-emerald-950 bg-emerald-50/50 p-3 rounded border border-emerald-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {remediation.hardened_prompt}
              </pre>
            </div>
          </div>

          {/* Active Defensive Mitigations Breakdown */}
          {remediation.mitigations && remediation.mitigations.length > 0 && (
            <div className="bg-white border-2 border-stone-900 rounded-xl p-5 shadow-[3px_3px_0px_#1C1917] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b-2 border-stone-900 pb-2">
                <FileText className="w-4 h-4 text-[#F95738]" />
                ACTIVE DEFENSIVE MITIGATION MATRIX ({remediation.mitigations.length} CLAUSES INJECTED)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {remediation.mitigations.map((m, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF6EE] border-2 border-stone-900 rounded-lg space-y-1.5 shadow-[2px_2px_0px_#1C1917]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-stone-900 bg-[#FFD000] px-1.5 py-0.5 border border-stone-900 rounded">
                        {m.category.replaceAll('_', ' ')}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700">MITIGATED</span>
                    </div>
                    <p className="text-[11px] font-bold text-stone-900 leading-snug">
                      "{m.defense_clause}"
                    </p>
                    <p className="text-[10px] text-stone-600 font-semibold italic">
                      Why: {m.explanation}
                    </p>
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
