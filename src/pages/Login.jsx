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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-gradient px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(600px 300px at 15% 10%, rgba(221,184,104,0.16), transparent 60%), radial-gradient(500px 260px at 90% 90%, rgba(31,76,128,0.35), transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <svg viewBox="0 0 44 44" className="mb-4 h-14 w-14 drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
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
          <h1 className="text-lg font-semibold text-white">SI-BERAT</h1>
          <p className="mt-1 text-sm text-white/50">Dinas PUPR &amp; Penataan Ruang Provinsi NTT</p>
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

          <p className="mt-4 text-center text-xs text-navy-900/45">
            Akun dibuat oleh administrator melalui Supabase Auth.
          </p>
        </form>
      </div>
    </div>
  )
}
