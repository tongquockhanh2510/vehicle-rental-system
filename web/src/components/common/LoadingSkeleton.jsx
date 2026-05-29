import React from 'react';

export default function LoadingSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-20 rounded-2xl border border-white/5 bg-slate-800/70" />
      ))}
    </div>
  );
}
