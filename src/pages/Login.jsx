import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Button from '../components/ui/Button'
import { FieldLabel, TextInput } from '../components/ui/Field'

const REMEMBER_KEY = 'siberat_remembered_email'

const BG_IMAGES = [
  '/assets/bg-alat-berat-1.jpg',
  '/assets/bg-alat-berat-2.jpg',
  '/assets/bg-alat-berat-3.jpg',
  '/assets/bg-alat-berat-4.jpg',
]

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
      <HeroBackground />

      {/* Logo & judul instansi — pojok kiri atas */}
      <div className="absolute left-0 top-0 z-10 flex items-start gap-3 p-6 sm:p-9">
        <img
          src="/assets/logo-pupr-icon.png"
          alt="Logo Kementerian PUPR"
          className="h-11 w-11 flex-none object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
        />
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
        <img
          src="/assets/logo-pupr-slogan.png"
          alt="Sigap Membangun Negeri"
          className="mt-5 h-10 w-auto opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] sm:h-12"
        />
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
            <img
              src="/assets/logo-pupr-icon.png"
              alt="Logo PUPR"
              className="h-9 w-9 flex-none object-contain"
            />
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

const HERO_SLIDE_DURATION = 6000 // ms per foto sebelum transisi ke foto berikutnya

function HeroBackground() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % BG_IMAGES.length)
    }, HERO_SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-navy-950">
      {/* Foto alat berat — crossfade bergantian */}
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

      {/* Overlay gradasi supaya teks & form tetap terbaca */}
      <div className="absolute inset-0 bg-navy-950/55" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(10,27,48,0.85) 0%, rgba(10,27,48,0.35) 45%, rgba(10,27,48,0) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,27,48,0) 0%, rgba(10,27,48,0.9) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 55% at 80% 50%, rgba(10,27,48,0.55) 0%, rgba(10,27,48,0) 100%)',
        }}
      />

      {/* Indikator slide */}
      <div className="absolute bottom-16 left-6 z-10 flex gap-1.5 sm:left-9 lg:bottom-6">
        {BG_IMAGES.map((src, index) => (
          <span
            key={src}
            className={`h-1 rounded-full transition-all duration-500 ${
              index === activeIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
