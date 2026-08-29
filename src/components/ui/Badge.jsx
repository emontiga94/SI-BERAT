import React from 'react'

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-100/70 text-amber-700',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
  teal: 'bg-teal-50 text-teal-700',
}

const DOTS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
  teal: 'bg-teal-500',
}

export default function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold leading-none ${TONES[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${DOTS[tone]}`} />
      {children}
    </span>
  )
}
