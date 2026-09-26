import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Cpu } from 'lucide-react';

export default function StrategyComparisonChart({ summary }) {
  const breakdown = summary?.strategy_breakdown || {};

  const strategyLabels = {
    seed_benchmark: "Seed Benchmark",
    zero_shot_lm: "Zero-Shot LM",
    few_shot_lm: "Few-Shot LM",
    prompt_mutation: "Prompt Mutation",
    rl_guided: "RL-Guided"
  };

  const chartData = Object.keys(strategyLabels).map((key) => {
    const data = breakdown[key] || { total: 0, passed: 0, failed: 0, ambiguous: 0, pass_rate: 100.0 };
    return {
      strategy: strategyLabels[key],
      passed: data.passed || 0,
      failed: data.failed || 0,
      ambiguous: data.ambiguous || 0,
      pass_rate: data.pass_rate
    };
  });

  return (
    <div className="border-2 border-stone-900 rounded-xl bg-[#FAF6EE] p-6 font-mono shadow-[6px_6px_0px_#1C1917]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-900">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#F95738]" />
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            PEREZ ET AL. STRATEGY COMPARISON
          </h3>
        </div>
        <span className="text-[10px] font-bold text-stone-900 bg-[#FFD000] px-2 py-0.5 border border-stone-900 rounded-sm">
          GENERATOR METRICS
        </span>
      </div>

      <div className="h-64 w-full" style={{ minHeight: '260px' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
            <XAxis
              dataKey="strategy"
              stroke="#1C1917"
              tick={{ fill: '#1C1917', fontSize: 11, fontFamily: 'Courier New', fontWeight: 'bold' }}
              interval={0}
              angle={-10}
              textAnchor="end"
            />
            <YAxis stroke="#1C1917" tick={{ fill: '#1C1917', fontSize: 11, fontFamily: 'Courier New', fontWeight: 'bold' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#FAF6EE', borderColor: '#1C1917', borderWidth: '2px', borderRadius: '4px', color: '#1C1917', fontFamily: 'Courier New', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Courier New', fontWeight: 'bold' }} />
            <Bar dataKey="passed" name="Robust (Pass)" fill="#10B981" radius={[2, 2, 0, 0]} stroke="#1C1917" strokeWidth={1.5} />
            <Bar dataKey="failed" name="Vulnerable (Fail)" fill="#F95738" radius={[2, 2, 0, 0]} stroke="#1C1917" strokeWidth={1.5} />
            <Bar dataKey="ambiguous" name="Ambiguous" fill="#FFD000" radius={[2, 2, 0, 0]} stroke="#1C1917" strokeWidth={1.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
