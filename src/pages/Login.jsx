import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

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
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500 text-sm font-bold text-amber-400">
            PUPR
          </div>
          <h1 className="text-lg font-semibold text-white">SIMSEWA Alat Berat</h1>
          <p className="mt-1 text-sm text-white/50">Dinas PUPR &amp; Penataan Ruang Provinsi NTT</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-xl">
          <label className="mb-1 block text-xs font-semibold text-navy-900/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@pupr-ntt.go.id"
            className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
          />

          <label className="mb-1 block text-xs font-semibold text-navy-900/70">Kata Sandi</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
          />

          {error && <p className="mb-2 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
          >
            {submitting ? 'Memproses&hellip;' : 'Masuk'}
          </button>

          <p className="mt-4 text-center text-xs text-navy-900/50">
            Akun dibuat oleh administrator melalui Supabase Auth.
          </p>
        </form>
      </div>
    </div>
  )
}
