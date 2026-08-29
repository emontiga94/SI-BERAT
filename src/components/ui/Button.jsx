import React from 'react'

const VARIANTS = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-soft',
  amber:
    'bg-amber-gradient text-navy-950 shadow-glow hover:brightness-[1.04] focus-visible:outline-navy-900',
  secondary: 'border border-slate-200 bg-white text-navy-900 hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-navy-900/70 hover:bg-slate-100 hover:text-navy-950',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
