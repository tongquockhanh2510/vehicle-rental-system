import React from 'react';

export default function OwnerOnboardingStepper({ steps = [], currentStep = 1 }) {
  return (
    <ol className="grid gap-2 md:grid-cols-5">
      {steps.map((item, idx) => {
        const stepNumber = idx + 1;
        const active = stepNumber === currentStep;
        const done = stepNumber < currentStep;

        return (
          <li
            key={item.key || item.label}
            className={`rounded-xl border px-3 py-2 text-xs ${
              done
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                : active
                  ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100'
                  : 'border-white/10 bg-slate-900/50 text-slate-300'
            }`}
          >
            <p className="font-semibold">Bước {stepNumber}</p>
            <p className="mt-1 line-clamp-2">{item.label}</p>
          </li>
        );
      })}
    </ol>
  );
}
