import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const navItems = [
  { to: '/', label: 'Ringkasan', icon: IconGrid, end: true },
  { to: '/alat', label: 'Data Alat Berat', icon: IconTruck },
  { to: '/sewa', label: 'Rekap Sewa', icon: IconClipboard },
]

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="no-print flex w-64 flex-shrink-0 flex-col bg-navy-950 text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-500 text-sm font-bold tracking-tight text-amber-400">
            PUPR
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-wide text-white">SIMSEWA</p>
            <p className="text-[11px] text-white/50">Alat Berat &middot; NTT</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-xs text-white/40">Masuk sebagai</p>
          <p className="mb-3 truncate text-sm font-medium text-white/90">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">{children}</div>
      </main>
    </div>
  )
}

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l4 3.2V16h-8z" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}

function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 11h8M8 15h8M8 19h5" />
    </svg>
  )
}
