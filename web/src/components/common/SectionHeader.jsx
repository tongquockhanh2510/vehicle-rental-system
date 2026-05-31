import React from 'react';

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-slate-300 md:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
