import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Button from '../components/ui/Button'
import { FieldLabel, TextInput } from '../components/ui/Field'

export default function Login() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError('Email atau kata sandi salah. Silakan coba lagi.')
      return
    }
    navigate('/')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-gradient px-4 py-10">
      {/* Peta kontur — motif garis ketinggian ala peta topografi/ukur tanah, menegaskan konteks PUPR (jalan & tata ruang) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" preserveAspectRatio="none">
        <defs>
          <pattern id="kontur" width="220" height="220" patternUnits="userSpaceOnUse">
            <path d="M-20 40 Q 40 10, 90 45 T 240 40" fill="none" stroke="#DDB868" strokeWidth="1" />
            <path d="M-20 90 Q 50 55, 100 95 T 240 88" fill="none" stroke="#DDB868" strokeWidth="1" />
            <path d="M-20 140 Q 60 105, 120 145 T 240 138" fill="none" stroke="#3E74B3" strokeWidth="1" />
            <path d="M-20 190 Q 45 165, 110 195 T 240 188" fill="none" stroke="#DDB868" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kontur)" />
      </svg>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(720px 380px at 12% 8%, rgba(221,184,104,0.22), transparent 62%), radial-gradient(640px 340px at 92% 95%, rgba(62,116,179,0.4), transparent 60%)',
        }}
      />

      {/* Aksen garis ukur — nada instrumen surveyor, sengaja hanya satu titik fokus di pojok */}
      <div className="pointer-events-none absolute -left-3 top-0 hidden h-full w-10 flex-col items-center opacity-30 sm:flex">
        <div className="h-full w-px bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <svg viewBox="0 0 44 44" className="mb-4 h-16 w-16 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
            <polygon
              points="22,1.5 40,11.5 40,32.5 22,42.5 4,32.5 4,11.5"
              fill="#0A1B30"
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
          <h1 className="text-xl font-semibold tracking-tight text-white">SI-BERAT</h1>
          <p className="mt-1 text-sm text-white/55">Dinas PUPR &amp; Penataan Ruang Provinsi NTT</p>
          <p className="mt-2.5 font-mono text-2xs tracking-wider text-amber-300/70">
            10.1772° S &middot; 123.6070° E — KUPANG
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white p-6 shadow-elevated sm:p-7">
          <div className="mb-4">
            <FieldLabel required>Email</FieldLabel>
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@pupr-ntt.go.id"
              autoComplete="email"
            />
          </div>

          <div className="mb-2">
            <FieldLabel required>Kata Sandi</FieldLabel>
            <TextInput
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 flex-none">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
              </svg>
              {error}
            </p>
          )}

          <Button type="submit" variant="amber" disabled={submitting} className="mt-5 w-full">
            {submitting ? 'Memproses\u2026' : 'Masuk'}
          </Button>

          <div className="mt-5 flex items-center gap-2 opacity-40">
            <span className="h-px flex-1 bg-navy-900/15" />
            <TickMarks />
            <span className="h-px flex-1 bg-navy-900/15" />
          </div>

          <p className="mt-3 text-center text-xs text-navy-900/45">
            Akun dibuat oleh administrator melalui Supabase Auth.
          </p>
        </form>
      </div>
    </div>
  )
}

function TickMarks() {
  return (
    <svg viewBox="0 0 60 8" className="h-2 w-14 flex-none text-navy-900/50">
      {[0, 10, 20, 30, 40, 50, 60].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2={x % 20 === 0 ? 8 : 4} stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}
