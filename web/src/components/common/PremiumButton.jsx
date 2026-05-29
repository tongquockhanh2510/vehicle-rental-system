import React from 'react';

export default function PremiumButton({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const styleMap = {
    primary: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
    secondary: 'border border-white/15 bg-white/5 text-white hover:bg-white/10',
    danger: 'bg-rose-500 text-white hover:bg-rose-400'
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-600 ${styleMap[variant] || styleMap.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
