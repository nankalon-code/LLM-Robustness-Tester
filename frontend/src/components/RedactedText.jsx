import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function RedactedText({ text, isOffensive = false, defaultRedacted = true }) {
  const [isRevealed, setIsRevealed] = useState(!defaultRedacted);

  if (!text) return null;

  if (!isRevealed) {
    return (
      <div className="inline-flex items-center gap-2">
        <span
          onClick={() => setIsRevealed(true)}
          className="redacted-block font-mono text-xs cursor-pointer select-none"
          title="Click to reveal redacted adversarial content"
        >
          ████████████████████████████████
        </span>
        <button
          onClick={() => setIsRevealed(true)}
          className="text-[10px] text-cyber-cyan hover:underline font-mono flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          <span>REVEAL</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="redacted-revealed font-mono text-xs break-words">
        {text}
      </div>
      <button
        onClick={() => setIsRevealed(false)}
        className="mt-1 text-[10px] text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1 cursor-pointer"
      >
        <EyeOff className="w-3 h-3" />
        <span>REDACT AGAIN</span>
      </button>
    </div>
  );
}
