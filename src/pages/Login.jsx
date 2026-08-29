import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Button from '../components/ui/Button'
import { FieldLabel, TextInput } from '../components/ui/Field'

const REMEMBER_KEY = 'siberat_remembered_email'

export default function Login() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError('Username/email atau kata sandi salah. Silakan coba lagi.')
      return
    }
    if (remember) {
      window.localStorage.setItem(REMEMBER_KEY, email)
    } else {
      window.localStorage.removeItem(REMEMBER_KEY)
    }
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-950">
      <HeroScene />

      {/* Logo & judul instansi — pojok kiri atas */}
      <div className="absolute left-0 top-0 z-10 flex items-start gap-3 p-6 sm:p-9">
        <Emblem className="h-11 w-11 flex-none drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]" />
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide text-white">SISTEM INFORMASI SEWA ALAT BERAT (SI-BERAT)</p>
          <p className="mt-1 text-xs text-white/70">Pemerintah Provinsi Nusa Tenggara Timur</p>
          <p className="text-xs text-white/70">Dinas Pekerjaan Umum &amp; Penataan Ruang</p>
        </div>
      </div>

      {/* Headline — pojok kiri bawah */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-28 sm:px-9 sm:pb-32 lg:max-w-xl lg:pb-16">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Selamat Datang di SI-BERAT Provinsi Nusa Tenggara Timur
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
          Digunakan untuk pendataan armada, pencatatan transaksi sewa, status pembayaran, dan
          pelaporan alat berat pada Dinas PUPR Provinsi Nusa Tenggara Timur.
        </p>
      </div>

      <p className="absolute bottom-5 left-6 z-10 text-2xs text-white/40 sm:left-9">
        Dinas PUPR Provinsi NTT &middot; SI-BERAT v1.0
      </p>

      {/* Kartu login — mengambang di kanan */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 lg:justify-end lg:pr-16 lg:py-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm animate-fade-in rounded-3xl border border-white/10 bg-white/95 p-6 shadow-elevated backdrop-blur sm:p-7"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <Emblem className="h-9 w-9 flex-none" dark />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-navy-950">SI-BERAT</p>
              <p className="text-2xs text-navy-900/45">Alat Berat &middot; NTT</p>
            </div>
          </div>
          <p className="mb-5 text-xs leading-relaxed text-navy-900/55">
            Masuk menggunakan akun yang telah diberikan oleh administrator Dinas PUPR Provinsi NTT.
          </p>

          <div className="mb-4">
            <FieldLabel required>Username atau Email</FieldLabel>
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@pupr-ntt.go.id"
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <FieldLabel required>Kata Sandi</FieldLabel>
            <div className="relative">
              <TextInput
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-900/35 hover:text-navy-900/60"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                <EyeIcon open={showPassword} className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1 flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-navy-900/60">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500/30"
              />
              Ingat Saya
            </label>
            <span className="text-xs font-medium text-navy-700">Hubungi Admin jika lupa password</span>
          </div>

          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 flex-none">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
              </svg>
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="mt-5 w-full justify-center"
            icon={!submitting ? <ArrowIcon className="h-4 w-4" /> : undefined}
          >
            {submitting ? 'Memproses\u2026' : 'Masuk'}
          </Button>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <p className="text-2xs font-medium text-navy-900/50">Dinas PUPR Provinsi NTT</p>
            <p className="text-2xs text-navy-900/30">SI-BERAT v1.0</p>
          </div>
        </form>
      </div>
    </div>
  )
}

function Emblem({ className = '', dark = false }) {
  return (
    <svg viewBox="0 0 44 44" className={className}>
      <polygon
        points="22,1.5 40,11.5 40,32.5 22,42.5 4,32.5 4,11.5"
        fill={dark ? '#0F2A4A' : '#0A1B30'}
        stroke="url(#loginEmblemGrad)"
        strokeWidth="1.6"
      />
      <defs>
        <linearGradient id="loginEmblemGrad" x1="0" y1="0" x2="44" y2="44">
          <stop offset="0%" stopColor="#DDB868" />
          <stop offset="100%" stopColor="#B5852E" />
        </linearGradient>
      </defs>
      <text
        x="22"
        y="26"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.5"
        fill="#DDB868"
        fontFamily="'IBM Plex Sans', sans-serif"
      >
        PUPR
      </text>
    </svg>
  )
}

function EyeIcon({ open, className = '' }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M6.6 6.7C4 8.3 2 12 2 12s3.6 7 10 7c1.9 0 3.5-.5 4.9-1.3M17.9 17.9C20.4 16.2 22 12 22 12s-1.2-2.4-3.5-4.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeroScene() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1B30" />
          <stop offset="55%" stopColor="#163A63" />
          <stop offset="100%" stopColor="#2D5F9A" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6E9D2" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F6E9D2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0A1B30" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#0A1B30" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0A1B30" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1B30" stopOpacity="0" />
          <stop offset="100%" stopColor="#0A1B30" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="cardVignette" cx="80%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0A1B30" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0A1B30" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />
      <circle cx="1180" cy="330" r="220" fill="url(#sun)" />

      {/* Pegunungan — tiga lapis, kian gelap ke depan */}
      <polygon
        points="0,560 140,430 260,500 420,380 560,470 720,400 860,480 1020,410 1180,470 1340,400 1600,460 1600,900 0,900"
        fill="#1F4C80"
        opacity="0.55"
      />
      <polygon
        points="0,640 180,530 340,600 520,500 700,590 900,510 1080,600 1260,520 1440,590 1600,540 1600,900 0,900"
        fill="#163A63"
        opacity="0.75"
      />
      <polygon
        points="0,720 220,650 400,700 620,630 820,700 1040,640 1240,700 1420,650 1600,690 1600,900 0,900"
        fill="#0F2A4A"
      />

      {/* Jalan beraspal — perspektif menuju cakrawala */}
      <polygon points="640,900 960,900 840,700 760,700" fill="#0A1B30" opacity="0.65" />
      <polygon points="690,900 910,900 815,700 785,700" fill="#163A63" opacity="0.5" />
      <g stroke="#DDB868" strokeWidth="4" opacity="0.35" strokeLinecap="round">
        <line x1="800" y1="880" x2="800" y2="850" />
        <line x1="798" y1="800" x2="798" y2="775" />
        <line x1="797" y1="740" x2="797" y2="720" />
      </g>

      {/* Siluet alat berat & truk di tepi jalan */}
      <g opacity="0.92">
        <g transform="translate(240,650) scale(1.6)">
          <rect x="0" y="18" width="46" height="22" rx="2" fill="#0A1B30" />
          <rect x="34" y="4" width="10" height="18" rx="1.5" fill="#0A1B30" />
          <path d="M44 10 L64 -4 L70 -2 L52 20 Z" fill="#0A1B30" />
          <path d="M64 -4 L74 -8 L80 -2 L70 -2 Z" fill="#0A1B30" />
          <circle cx="10" cy="42" r="7" fill="#0A1B30" />
          <circle cx="30" cy="42" r="7" fill="#0A1B30" />
        </g>
        <g transform="translate(1120,660) scale(1.45)">
          <rect x="0" y="10" width="58" height="26" rx="2" fill="#0A1B30" />
          <rect x="52" y="-4" width="20" height="30" rx="2" fill="#0A1B30" />
          <rect x="54" y="0" width="8" height="9" fill="#163A63" />
          <circle cx="12" cy="40" r="8" fill="#0A1B30" />
          <circle cx="30" cy="40" r="8" fill="#0A1B30" />
          <circle cx="58" cy="40" r="8" fill="#0A1B30" />
        </g>
      </g>

      {/* Titik debu tersebar */}
      <g fill="#F6E9D2" opacity="0.12">
        <circle cx="380" cy="600" r="3" />
        <circle cx="520" cy="640" r="2" />
        <circle cx="900" cy="610" r="2.5" />
        <circle cx="1000" cy="660" r="2" />
        <circle cx="1300" cy="600" r="3" />
      </g>

      <rect width="1600" height="900" fill="url(#fadeLeft)" />
      <rect width="1600" height="900" fill="url(#fadeBottom)" />
      <rect width="1600" height="900" fill="url(#cardVignette)" />
    </svg>
  )
}
