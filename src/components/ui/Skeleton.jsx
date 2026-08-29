import React from 'react'

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton rounded-md ${className}`} />
}

export function SkeletonTableRows({ rows = 4, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <SkeletonLine className="h-3.5 w-full max-w-[10rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <SkeletonLine className="h-2.5 w-24" />
      <SkeletonLine className="mt-3 h-6 w-32" />
    </div>
  )
}
