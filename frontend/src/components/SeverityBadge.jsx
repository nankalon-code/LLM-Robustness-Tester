import React from 'react';

const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-800 border-red-800',
  high: 'bg-orange-100 text-orange-800 border-orange-800',
  medium: 'bg-amber-100 text-amber-800 border-amber-800',
  low: 'bg-blue-100 text-blue-800 border-blue-800',
  none: 'bg-stone-100 text-stone-700 border-stone-400',
};

export default function SeverityBadge({ severity }) {
  const normSev = (severity || 'none').toLowerCase();
  const style = SEVERITY_STYLES[normSev] || SEVERITY_STYLES.none;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border-2 font-mono ${style}`}>
      {normSev}
    </span>
  );
}
