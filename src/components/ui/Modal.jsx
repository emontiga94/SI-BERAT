import React, { useEffect, useState } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  widthClass = 'max-w-lg',
  children,
}) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      const t = setTimeout(() => setMounted(false), 160)
      return () => clearTimeout(t)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return undefined
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-navy-950/55 px-4 py-8 backdrop-blur-sm sm:items-center ${
        closing ? 'opacity-0 transition-opacity duration-150' : 'animate-overlay-in'
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className={`w-full ${widthClass} overflow-hidden rounded-3xl border border-white/60 bg-white shadow-elevated ${
          closing ? 'animate-panel-out' : 'animate-panel-in'
        }`}
      >
        {(title || icon) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-navy-900 text-amber-400">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-base font-semibold text-navy-950">{title}</h2>
                {description && <p className="mt-0.5 text-xs text-navy-900/50">{description}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-navy-900/40 transition-colors hover:bg-slate-100 hover:text-navy-900"
              aria-label="Tutup"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function ModalBody({ className = '', children }) {
  return <div className={`max-h-[70vh] overflow-y-auto px-6 py-5 ${className}`}>{children}</div>
}

export function ModalFooter({ className = '', children }) {
  return (
    <div
      className={`flex flex-none items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 ${className}`}
    >
      {children}
    </div>
  )
}

export function FieldSection({ label, children, className = '' }) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <p className="mb-3 text-2xs font-bold uppercase tracking-wider text-amber-700/80">{label}</p>
      )}
      <div className="space-y-3.5">{children}</div>
    </div>
  )
}
