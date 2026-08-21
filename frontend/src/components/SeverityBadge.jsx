import React from 'react';

const SEVERITY_STYLES = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  none: 'bg-slate-800 text-slate-400 border-slate-700',
};

export default function SeverityBadge({ severity }) {
  const normSev = (severity || 'none').toLowerCase();
  const style = SEVERITY_STYLES[normSev] || SEVERITY_STYLES.none;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${style}`}>
      {normSev}
    </span>
  );
}
