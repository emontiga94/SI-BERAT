import React from 'react'

const base =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm outline-none transition placeholder:text-navy-900/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15'

const invalidCls = 'border-red-300 focus:border-red-500 focus:ring-red-500/15'

export function FieldLabel({ children, hint, required }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="text-2xs font-bold uppercase tracking-wide text-navy-900/55">
        {children}
        {required && <span className="ml-0.5 text-amber-600">*</span>}
      </label>
      {hint && <span className="text-2xs text-navy-900/35">{hint}</span>}
    </div>
  )
}

export function TextInput({ className = '', invalid, ...props }) {
  return <input className={`${base} ${invalid ? invalidCls : ''} ${className}`} {...props} />
}

export function Textarea({ className = '', invalid, ...props }) {
  return <textarea className={`${base} resize-none ${invalid ? invalidCls : ''} ${className}`} {...props} />
}

export function Select({ className = '', invalid, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={`${base} appearance-none pr-9 ${invalid ? invalidCls : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/40"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function CurrencyInput({ value, onValueChange, className = '', invalid, prefix = 'Rp', ...props }) {
  const display = value === '' || value === null || value === undefined ? '' : Number(value).toLocaleString('id-ID')

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '')
    onValueChange(digits)
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-navy-900/35">
        {prefix}
      </span>
      <input
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        className={`${base} pl-10 font-mono ${invalid ? invalidCls : ''} ${className}`}
        {...props}
      />
    </div>
  )
}
