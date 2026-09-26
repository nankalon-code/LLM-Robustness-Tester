import React, { useState } from 'react';
import { Activity, Zap, Radio, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NeuralScanVisualizer({ summary, run }) {
  const [selectedProbe, setSelectedProbe] = useState(0);

  const probes = [
    { id: 'roleplay_bypass', name: 'Roleplay & Persona Bypass', region: 'Prefrontal Cortex Probe A', freq: '440 Hz' },
    { id: 'prompt_leakage', name: 'System Instruction Leakage', region: 'Temporal Lobe Probe B', freq: '820 Hz' },
    { id: 'encoding_obfuscation', name: 'Base64, Hex & ROT13 Obfuscation', region: 'Occipital Node Probe C', freq: '120 Hz' },
    { id: 'multilingual_jailbreak', name: 'Cross-Lingual Evasion', region: 'Broca Speech Center Probe D', freq: '610 Hz' },
    { id: 'context_delimiter_escape', name: 'Special Token Boundary Escape', region: 'Parietal Lobe Relay Probe E', freq: '740 Hz' },
    { id: 'hallucination_trigger', name: 'Factual Hallucination Trigger', region: 'Limbic Network Probe F', freq: '310 Hz' },
    { id: 'tool_function_calling_injection', name: 'Tool & Function Hijacking', region: 'Motor Cortex Probe G', freq: '890 Hz' },
    { id: 'refusal_failure', name: 'Refusal Policy Sensitivity', region: 'Brainstem Safety Relay Probe H', freq: '950 Hz' },
    { id: 'indirect_prompt_injection', name: 'Indirect Context Injection', region: 'Sensory Node Probe I', freq: '520 Hz' },
    { id: 'schema_hijacking', name: 'Structured Schema Hijacking', region: 'Thalamus Data Relay Probe J', freq: '380 Hz' },
    { id: 'sycophancy_and_untruthful_compliance', name: 'Sycophancy & Epistemic Truth', region: 'Prefrontal Medial Probe K', freq: '290 Hz' },
    { id: 'misinformation', name: 'Disinformation & Misinfo', region: 'Anterior Cingulate Probe L', freq: '470 Hz' }
  ];

  const breakdown = summary?.category_breakdown || {};
  const currentProbe = probes[selectedProbe] || probes[0];
  const probeData = breakdown[currentProbe.id] || { passed: 0, failed: 0, ambiguous: 0 };
  const isVulnerable = probeData.failed > 0;

  const probeCoordinates = [
    { cx: 80, cy: 50 },
    { cx: 125, cy: 65 },
    { cx: 145, cy: 110 },
    { cx: 65, cy: 105 },
    { cx: 110, cy: 95 },
    { cx: 75, cy: 135 },
    { cx: 135, cy: 140 },
    { cx: 100, cy: 165 },
    { cx: 90, cy: 80 },
    { cx: 130, cy: 95 },
    { cx: 95, cy: 120 },
    { cx: 115, cy: 135 }
  ];

  return (
    <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-6 shadow-[6px_6px_0px_#1C1917] font-mono">
      {/* Header telemetry readout */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-stone-900 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFD000] border-2 border-stone-900 text-stone-900 rounded font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">NEURAL DIAGNOSTIC TELEMETRY</h3>
              <span className="stamp-specimen text-[10px]">[ENI] #00762</span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">Perez et al. Multi-Probe Red Teaming Vulnerability Scan</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="border-2 border-stone-900 bg-white px-3 py-1.5 rounded flex items-center gap-2 shadow-[2px_2px_0px_#1C1917]">
            <Zap className="w-3.5 h-3.5 text-[#F95738]" />
            <span className="text-stone-600">IMPULSE:</span>
            <span className="text-stone-950 font-black">0.5 Amps</span>
          </div>
          <div className="border-2 border-stone-900 bg-white px-3 py-1.5 rounded flex items-center gap-2 shadow-[2px_2px_0px_#1C1917]">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-stone-600">STATE:</span>
            <span className="text-emerald-700 font-black">PROBED</span>
          </div>
        </div>
      </div>

      {/* Main HUD grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Brain MRI Contour Canvas */}
        <div className="lg:col-span-6 bg-[#EFE6D5] border-2 border-stone-900 rounded-xl p-4 flex flex-col items-center justify-center relative shadow-[3px_3px_0px_#1C1917]">
          <div className="absolute top-3 left-3 text-[10px] text-stone-600 font-bold font-mono">
            <div>SPECIMEN: TARGET_LLM_V4</div>
            <div>STATUS: DIAGNOSTIC ACTIVE</div>
          </div>
          <div className="absolute bottom-3 right-3 stamp-specimen text-[9px]">
            B3 » 0.5 Amps
          </div>

          {/* SVG Vintage Diagram */}
          <div className="relative my-4">
            <svg className="w-64 h-64 text-stone-900" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              {/* Brain contours in vintage ink line style */}
              <path d="M100 20 C60 20, 30 50, 30 90 C30 130, 50 170, 90 180 C110 185, 140 180, 160 160 C175 145, 180 110, 175 80 C170 50, 140 20, 100 20 Z" strokeWidth="2.5" strokeDasharray="6 3" />
              <path d="M50 70 C70 40, 130 40, 150 70" strokeWidth="2" className="opacity-60" />
              <path d="M40 100 C70 90, 120 110, 160 100" strokeWidth="2" className="opacity-60" />
              <path d="M60 140 C80 120, 120 130, 140 150" strokeWidth="2" className="opacity-60" />

              {/* Probe Points */}
              {probes.slice(0, 8).map((p, idx) => {
                const pt = probeCoordinates[idx];
                const probeCat = p.id;
                const failCount = (breakdown[probeCat]?.failed || 0);
                const isFailed = failCount > 0;
                const isSelected = selectedProbe === idx;

                return (
                  <g key={idx} onClick={() => setSelectedProbe(idx)} className="cursor-pointer">
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r={isSelected ? "11" : "7"}
                      fill={isFailed ? '#F95738' : '#FFD000'}
                      stroke="#1C1917"
                      strokeWidth="2.5"
                    />
                    <circle cx={pt.cx} cy={pt.cy} r="2.5" fill="#1C1917" />
                    <text x={pt.cx + 12} y={pt.cy + 4} fill="#1C1917" fontSize="9" fontWeight="900">
                      P{idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full text-center text-[10px] text-stone-700 font-bold">
            [CLICK PROBES P1-P8 TO INSPECT TELEMETRY CHANNELS]
          </div>
        </div>

        {/* Right Column: Active Probe Diagnostics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#FAF6EE] p-4 border-2 border-stone-900 rounded-xl shadow-[3px_3px_0px_#1C1917]">
            <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mb-1">SELECTED TELEMETRY PROBE</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-stone-900">{currentProbe.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-black border-2 border-stone-900 uppercase ${isVulnerable ? 'bg-[#F95738] text-white' : 'bg-emerald-200 text-stone-900'}`}>
                {isVulnerable ? 'COMPROMISED' : 'ROBUST'}
              </span>
            </div>
            <div className="text-xs text-stone-600 mt-1 font-bold">{currentProbe.region} • Frequency: {currentProbe.freq}</div>
          </div>

          {/* Metrics Panel */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 border-2 border-stone-900 rounded-xl text-center shadow-[2px_2px_0px_#1C1917]">
              <div className="text-[10px] text-stone-600 font-bold uppercase">PASS RATE</div>
              <div className="text-lg font-black text-stone-900 mt-0.5">
                {probeData.passed + probeData.failed > 0
                  ? Math.round((probeData.passed / (probeData.passed + probeData.failed)) * 100)
                  : 100}%
              </div>
            </div>
            <div className="bg-white p-3 border-2 border-stone-900 rounded-xl text-center shadow-[2px_2px_0px_#1C1917]">
              <div className="text-[10px] text-stone-600 font-bold uppercase">PASSES</div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">{probeData.passed}</div>
            </div>
            <div className="bg-white p-3 border-2 border-stone-900 rounded-xl text-center shadow-[2px_2px_0px_#1C1917]">
              <div className="text-[10px] text-stone-600 font-bold uppercase">BREACHES</div>
              <div className="text-lg font-black text-[#F95738] mt-0.5">{probeData.failed}</div>
            </div>
          </div>

          {/* Probe Channel Selector Buttons */}
          <div className="space-y-2">
            <div className="text-[10px] text-stone-600 font-bold uppercase">TELEMETRY PROBE CHANNELS</div>
            <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
              {probes.map((p, idx) => {
                const pData = breakdown[p.id] || { passed: 0, failed: 0 };
                const hasFail = pData.failed > 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProbe(idx)}
                    className={`w-full text-left px-3 py-1.5 rounded border-2 border-stone-900 text-xs flex items-center justify-between transition-all cursor-pointer font-bold ${
                      selectedProbe === idx
                        ? 'bg-[#FFD000] text-stone-950 shadow-[2px_2px_0px_#1C1917]'
                        : 'bg-white text-stone-800 hover:bg-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-600 font-extrabold">P{idx + 1}</span>
                      <span className="truncate max-w-[200px]">{p.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {hasFail ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#F95738]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                      <span className="text-[10px] text-stone-700">{pData.passed}P / {pData.failed}F</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
