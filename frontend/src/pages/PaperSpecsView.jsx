import React from 'react';
import { BookOpen, Cpu, Shield, AlertTriangle, Layers } from 'lucide-react';

export default function PaperSpecsView() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 font-mono">
      {/* Header Banner */}
      <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-8 shadow-[6px_6px_0px_#1C1917] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-2 border-stone-900 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#F95738] text-xs font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>RESEARCH PAPER REFERENCE MANUAL</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Red Teaming Language Models with Language Models
            </h2>
            <p className="text-xs text-stone-700 font-bold mt-2 leading-relaxed">
              Ethan Perez, Saffron Huang, Francis Song, Trevor Cai, Roman Ring, John Aslanides, Amelia Glaese, Nat McAleese, Geoffrey Irving (DeepMind, NYU — 2022)
            </p>
          </div>
          <span className="stamp-classified text-xs">CITATION MATCHED</span>
        </div>

        {/* Warning Callout Box */}
        <div className="mt-6 p-4 bg-[#F95738] text-white border-2 border-stone-900 rounded-lg text-xs flex items-start gap-3 shadow-[3px_3px_0px_#1C1917]">
          <AlertTriangle className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
          <div className="font-bold">
            <strong className="uppercase font-black">Paper Safety Warning:</strong>
            <p className="mt-1 leading-relaxed">
              "This paper contains model outputs which are offensive in nature." To address safety and compliance while allowing security analysis, this web tool defaults to <strong>Typewriter Censorship Mode</strong> (<span className="text-yellow-300">████████</span>) for adversarial logs with manual reveal controls.
            </p>
          </div>
        </div>
      </div>

      {/* Core Methodology Architecture Diagram */}
      <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-8 shadow-[6px_6px_0px_#1C1917]">
        <h3 className="text-base font-black text-stone-900 uppercase tracking-wider mb-6 flex items-center gap-2 pb-2 border-b-2 border-stone-900">
          <Layers className="w-5 h-5 text-[#F95738]" />
          <span>Generator → Target → Judge Evaluation Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Generator */}
          <div className="bg-white p-5 rounded-lg border-2 border-stone-900 flex flex-col justify-between space-y-4 shadow-[3px_3px_0px_#1C1917]">
            <div>
              <div className="text-[10px] text-[#F95738] font-black uppercase tracking-wider">STAGE 1: GENERATOR LM</div>
              <h4 className="text-sm font-black text-stone-900 mt-1">Adversarial Prompt Synthesis</h4>
              <p className="text-xs text-stone-700 font-bold mt-2 leading-relaxed">
                Uses Red Team LM generators to craft novel adversarial test cases via Zero-shot prompting, Few-shot attack examples, Prompt mutation, and RL gradient optimization.
              </p>
            </div>
            <div className="text-[10px] text-stone-900 font-bold bg-[#FFD000] p-2 rounded border border-stone-900">
              Strategies: zero_shot_lm, few_shot_lm, prompt_mutation, rl_guided
            </div>
          </div>

          {/* Step 2: Target */}
          <div className="bg-white p-5 rounded-lg border-2 border-stone-900 flex flex-col justify-between space-y-4 shadow-[3px_3px_0px_#1C1917]">
            <div>
              <div className="text-[10px] text-amber-800 font-black uppercase tracking-wider">STAGE 2: TARGET SYSTEM</div>
              <h4 className="text-sm font-black text-stone-900 mt-1">Prompt / Endpoint Execution</h4>
              <p className="text-xs text-stone-700 font-bold mt-2 leading-relaxed">
                Executes generated attacks against the developer's target system prompt, guardrailed base prompt, or HTTP API endpoint across single and multi-turn escalation turns.
              </p>
            </div>
            <div className="text-[10px] text-stone-900 font-bold bg-[#FFD000] p-2 rounded border border-stone-900">
              Interfaces: System Prompt, Base Prompt, API Endpoint
            </div>
          </div>

          {/* Step 3: Judge */}
          <div className="bg-white p-5 rounded-lg border-2 border-stone-900 flex flex-col justify-between space-y-4 shadow-[3px_3px_0px_#1C1917]">
            <div>
              <div className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">STAGE 3: EVALUATOR LLM</div>
              <h4 className="text-sm font-black text-stone-900 mt-1">Failure Classification & Scoring</h4>
              <p className="text-xs text-stone-700 font-bold mt-2 leading-relaxed">
                Evaluates responses against strict security rubrics to classify safety bypass, prompt leakage, refusal sensitivity, or hallucination severity (0-100 score).
              </p>
            </div>
            <div className="text-[10px] text-stone-900 font-bold bg-[#FFD000] p-2 rounded border border-stone-900">
              Scoring: Robust / Vulnerable / Ambiguous
            </div>
          </div>
        </div>
      </div>

      {/* 5 Generation Strategies from Perez et al. */}
      <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-8 space-y-6 shadow-[6px_6px_0px_#1C1917]">
        <h3 className="text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b-2 border-stone-900">
          <Cpu className="w-5 h-5 text-[#F95738]" />
          <span>Perez et al. (2022) Red Teaming Strategies Implemented</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
          <div className="bg-white p-4 rounded-lg border-2 border-stone-900 space-y-2 shadow-[2px_2px_0px_#1C1917]">
            <span className="text-[#F95738] font-black">1. Zero-Shot LM Red Teaming</span>
            <p className="text-stone-700 leading-relaxed">
              Prompts a Generator LM to automatically invent novel adversarial prompts targeting system boundaries without human hardcoding.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-stone-900 space-y-2 shadow-[2px_2px_0px_#1C1917]">
            <span className="text-[#F95738] font-black">2. Few-Shot LM Red Teaming</span>
            <p className="text-stone-700 leading-relaxed">
              Provides high-impact attack examples in-context to steer the Generator LM toward synthesizing creative variants.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-stone-900 space-y-2 shadow-[2px_2px_0px_#1C1917]">
            <span className="text-[#F95738] font-black">3. Prompt Mutation Engine</span>
            <p className="text-stone-700 leading-relaxed">
              Applies algorithmic perturbations (Base64 encoding, Leetspeak, Roleplay wrappers, Adversarial suffix injection) to seed prompts.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-stone-900 space-y-2 shadow-[2px_2px_0px_#1C1917]">
            <span className="text-[#F95738] font-black">4. RL-Guided / Evolutionary Search</span>
            <p className="text-stone-700 leading-relaxed">
              Simulates gradient search by iteratively mutating top failure triggers to maximize target failure probability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
