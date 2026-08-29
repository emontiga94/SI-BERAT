import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { supabase } from '../supabaseClient'
import { formatRupiah } from '../lib/format'
import { SkeletonStatCard, SkeletonLine } from '../components/ui/Skeleton'

const BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

export default function Dashboard() {
  const [alat, setAlat] = useState([])
  const [sewa, setSewa] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [alatRes, sewaRes] = await Promise.all([
        supabase.from('alat_berat').select('*'),
        supabase.from('sewa').select('*').order('created_at', { ascending: false }),
      ])
      if (alatRes.error) setErrorMsg(alatRes.error.message)
      if (sewaRes.error) setErrorMsg(sewaRes.error.message)
      setAlat(alatRes.data || [])
      setSewa(sewaRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalPendapatan = sewa.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0)
    const belumLunas = sewa.filter((s) => s.status_pembayaran === 'Belum Lunas')
    const alatAktif = alat.filter((a) => a.kondisi?.startsWith('Aktif')).length
    const penyewaUnik = new Set(sewa.map((s) => s.nama_penyewa)).size
    return {
      totalPendapatan,
      totalTransaksi: sewa.length,
      belumLunasCount: belumLunas.length,
      belumLunasTotal: belumLunas.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0),
      alatAktif,
      totalAlat: alat.length,
      penyewaUnik,
    }
  }, [sewa, alat])

  const chartData = useMemo(() => {
    const byMonth = {}
    sewa.forEach((s) => {
      const d = s.tanggal_mulai ? new Date(s.tanggal_mulai) : new Date(s.created_at)
      if (Number.isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${d.getMonth()}`
      byMonth[key] = (byMonth[key] || 0) + Number(s.jumlah_harga || 0)
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, total]) => {
        const [, month] = key.split('-')
        return { bulan: BULAN[Number(month)], total }
      })
  }, [sewa])

  const kondisiBreakdown = useMemo(() => {
    const counts = {}
    alat.forEach((a) => {
      counts[a.kondisi] = (counts[a.kondisi] || 0) + 1
    })
    return counts
  }, [alat])

  return (
    <div>
      <header className="mb-8">
        <p className="mb-1 text-2xs font-bold uppercase tracking-widest text-amber-700/70">Beranda</p>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-950">Ringkasan</h1>
        <p className="mt-1.5 text-sm text-navy-900/55">
          Ikhtisar sewa alat berat Dinas PUPR &amp; Penataan Ruang Provinsi NTT.
        </p>
      </header>

      {errorMsg && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 flex-none">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
          </svg>
          {errorMsg}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Pendapatan Sewa" value={formatRupiah(stats.totalPendapatan)} accent icon={<IconCoins />} />
            <StatCard label="Transaksi Sewa" value={stats.totalTransaksi} icon={<IconClipboard />} />
            <StatCard label="Alat Aktif" value={`${stats.alatAktif} / ${stats.totalAlat}`} icon={<IconTruck />} />
            <StatCard label="Penyewa Unik" value={stats.penyewaUnik} icon={<IconUsers />} />
          </>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-navy-950">Pendapatan Sewa per Bulan</h2>
          </div>
          <div className="p-5">
            {loading ? (
              <SkeletonLine className="h-[260px] w-full" />
            ) : chartData.length === 0 ? (
              <EmptyMini text="Belum ada data transaksi." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9EE" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#0F2A4A99' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#0F2A4A99' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                  />
                  <Tooltip
                    formatter={(v) => formatRupiah(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E9EE', boxShadow: '0 8px 24px -8px rgba(10,27,48,0.18)' }}
                  />
                  <Bar dataKey="total" fill="#C99A3C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-navy-950">Kondisi Armada</h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-full" />
              </div>
            ) : (
              <ul className="space-y-3">
                {Object.entries(kondisiBreakdown).map(([kondisi, count]) => (
                  <li key={kondisi} className="flex items-center justify-between text-sm">
                    <span className="text-navy-900/70">{kondisi}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-navy-950">
                      {count}
                    </span>
                  </li>
                ))}
                {Object.keys(kondisiBreakdown).length === 0 && <EmptyMini text="Belum ada data alat." />}
              </ul>
            )}
            <Link
              to="/alat"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline"
            >
              Kelola data alat
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {!loading && stats.belumLunasCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-300/50 bg-amber-50 p-5">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-gradient" />
          <p className="text-sm font-semibold text-amber-800">
            {stats.belumLunasCount} tagihan belum lunas senilai {formatRupiah(stats.belumLunasTotal)}
          </p>
          <Link to="/sewa" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline">
            Lihat daftar sewa
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-elevated">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent ? 'bg-amber-gradient' : 'bg-navy-900/10'}`} />
      <div className="flex items-start justify-between">
        <p className="text-2xs font-bold uppercase tracking-wide text-navy-900/45">{label}</p>
        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${
            accent ? 'bg-amber-50 text-amber-600' : 'bg-navy-900/5 text-navy-800'
          }`}
        >
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${accent ? 'text-amber-600' : 'text-navy-950'}`}>
        {value}
      </p>
    </div>
  )
}

function EmptyMini({ text }) {
  return <p className="py-6 text-center text-sm text-navy-900/45">{text}</p>
}

function IconCoins(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v5c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 11v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" strokeLinecap="round" />
    </svg>
  )
}
function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 11h8M8 15h8M8 19h5" strokeLinecap="round" />
    </svg>
  )
}
function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l4 3.2V16h-8z" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}
function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16 8.2a3 3 0 1 1 3.6 4.6M20 19c-.1-2.4-1.3-4.2-3.3-5.1" strokeLinecap="round" />
    </svg>
  )
}
