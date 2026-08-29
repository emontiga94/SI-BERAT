import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { todayLong } from '../lib/format'

const navItems = [
  { to: '/', label: 'Ringkasan', icon: IconGrid, end: true },
  { to: '/alat', label: 'Data Alat Berat', icon: IconTruck },
  { to: '/sewa', label: 'Rekap Sewa', icon: IconClipboard },
]

const BG_IMAGES = [
  '/assets/bg-alat-berat-1.jpg',
  '/assets/bg-alat-berat-2.jpg',
  '/assets/bg-alat-berat-3.jpg',
  '/assets/bg-alat-berat-4.jpg',
  '/assets/bg-alat-berat-5.jpg',
  '/assets/bg-alat-berat-6.jpg',
  '/assets/bg-alat-berat-7.jpg',
  '/assets/bg-alat-berat-8.jpg',
]

const SIDEBAR_SLIDE_DURATION = 6000 // ms per foto sebelum transisi ke foto berikutnya
const SIDEBAR_COLLAPSE_KEY = 'siberat_sidebar_collapsed'

function SidebarBackground() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % BG_IMAGES.length)
    }, SIDEBAR_SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {BG_IMAGES.map((src, index) => (
        <div
          key={src}
          aria-hidden={index !== activeIndex}
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${src})`,
            opacity: index === activeIndex ? 1 : 0,
            transition: 'opacity 1800ms ease-in-out',
          }}
        />
      ))}
      {/* Overlay navy supaya teks & ikon tetap terbaca */}
      <div className="absolute inset-0 bg-navy-950/80" />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,27,48,0.55) 0%, rgba(10,27,48,0.92) 100%)',
        }}
      />
    </div>
  )
}

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1'
  })

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v
      window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = (user?.email || '?')
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex flex-shrink-0 flex-col text-white transition-[transform,width] duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-64 lg:w-20' : 'w-64'}`}
      >
        <SidebarBackground />

        {/* Tombol ciutkan/lebarkan — hanya desktop */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-8 z-10 hidden h-6 w-6 flex-none items-center justify-center rounded-full border border-white/20 bg-navy-900 text-white/70 shadow-md transition-colors hover:bg-navy-700 hover:text-white lg:flex"
          aria-label={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
          title={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={`flex items-center gap-3 px-6 py-6 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <img
            src="/assets/logo-pupr-icon.png"
            alt="Logo PUPR"
            className="h-11 w-11 flex-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
          />
          <div className={`min-w-0 leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="truncate text-[13px] font-semibold tracking-wide text-white">SI-BERAT</p>
            <p className="truncate text-[11px] text-white/45">Alat Berat &middot; NTT</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className={`mb-2 mt-4 px-6 text-2xs font-bold uppercase tracking-widest text-white/25 ${collapsed ? 'lg:hidden' : ''}`}>
          Navigasi
        </p>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  collapsed ? 'lg:justify-center lg:px-0' : ''
                } ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-amber-gradient transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon className={`h-[18px] w-[18px] flex-none ${isActive ? 'text-amber-400' : ''}`} />
                  <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className={`mb-3 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-amber-gradient text-xs font-bold text-navy-950">
              {initials || 'U'}
            </div>
            <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-xs font-medium text-white/90">{user?.email}</p>
              <p className="text-2xs text-white/40">Masuk</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title={collapsed ? 'Keluar' : undefined}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 flex-none">
              <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={collapsed ? 'lg:hidden' : ''}>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-900 hover:bg-slate-100"
            aria-label="Buka menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-sm font-semibold text-navy-950">SI-BERAT</p>
        </header>

        <div className="no-print hidden items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 py-2.5 backdrop-blur lg:flex">
          <div className="flex items-center gap-1.5 text-2xs font-medium text-navy-900/45">
            <span className="h-1.5 w-1.5 flex-none animate-pulse rounded-full bg-emerald-500" />
            Sistem aktif &middot; Dinas PUPR Provinsi NTT
          </div>
          <p className="text-2xs font-medium text-navy-900/45">{todayLong()}</p>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 md:px-10">{children}</div>
        </main>
      </div>
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
