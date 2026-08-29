import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
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

const KONDISI_META = {
  'Aktif': { color: '#189C8E', label: 'Aktif' },
  'Aktif / Lainnya': { color: '#3FBBAC', label: 'Aktif / Lainnya' },
  'Tidak Aktif / Rusak Ringan': { color: '#DDB868', label: 'Rusak Ringan' },
  'Tidak Aktif / Rusak Berat': { color: '#E0645C', label: 'Rusak Berat' },
  'Tidak Ada': { color: '#B8C0CC', label: 'Tidak Ada' },
}

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
    const belumDitagih = belumLunas.filter((s) => !s.sudah_ditagih)
    const alatAktif = alat.filter((a) => a.kondisi?.startsWith('Aktif')).length
    const penyewaUnik = new Set(sewa.map((s) => s.nama_penyewa)).size
    return {
      totalPendapatan,
      totalTransaksi: sewa.length,
      belumLunasCount: belumLunas.length,
      belumLunasTotal: belumLunas.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0),
      belumDitagihCount: belumDitagih.length,
      belumDitagihTotal: belumDitagih.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0),
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

  const trendPct = useMemo(() => {
    if (chartData.length < 2) return null
    const prev = chartData[chartData.length - 2].total
    const curr = chartData[chartData.length - 1].total
    if (!prev) return null
    return Math.round(((curr - prev) / prev) * 100)
  }, [chartData])

  const kondisiBreakdown = useMemo(() => {
    const counts = {}
    alat.forEach((a) => {
      counts[a.kondisi] = (counts[a.kondisi] || 0) + 1
    })
    return counts
  }, [alat])

  const kondisiTotal = Object.values(kondisiBreakdown).reduce((a, b) => a + b, 0) || 1

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-2xs font-bold uppercase tracking-widest text-amber-700/70">Beranda</p>
          <h1 className="text-[26px] font-semibold tracking-tight text-navy-950">Ringkasan</h1>
          <p className="mt-1.5 text-sm text-navy-900/50">
            Ikhtisar sewa alat berat Dinas PUPR &amp; Penataan Ruang Provinsi NTT.
          </p>
        </div>
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Pendapatan Sewa"
              value={formatRupiah(stats.totalPendapatan)}
              accent
              icon={<IconCoins />}
              delta={trendPct}
            />
            <StatCard label="Transaksi Sewa" value={stats.totalTransaksi} icon={<IconClipboard />} tone="teal" />
            <StatCard label="Alat Aktif" value={`${stats.alatAktif} / ${stats.totalAlat}`} icon={<IconTruck />} tone="navy" />
            <StatCard label="Penyewa Unik" value={stats.penyewaUnik} icon={<IconUsers />} tone="slate" />
          </>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-navy-950">Pendapatan Sewa per Bulan</h2>
              <p className="mt-0.5 text-xs text-navy-900/40">Akumulasi nilai transaksi tiap bulan berjalan</p>
            </div>
            {trendPct !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  trendPct >= 0 ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={`h-3 w-3 ${trendPct < 0 ? 'rotate-180' : ''}`}>
                  <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {Math.abs(trendPct)}%
              </span>
            )}
          </div>
          <div className="px-3 py-5 sm:px-6">
            {loading ? (
              <SkeletonLine className="h-[260px] w-full" />
            ) : chartData.length === 0 ? (
              <EmptyMini text="Belum ada data transaksi." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#189C8E" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#189C8E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#E9ECF1" vertical={false} />
                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 12, fill: '#0F2A4A80' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#0F2A4A80' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                    width={48}
                  />
                  <Tooltip
                    formatter={(v) => [formatRupiah(v), 'Pendapatan']}
                    cursor={{ stroke: '#189C8E', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E5E9EE',
                      boxShadow: '0 12px 28px -10px rgba(10,27,48,0.22)',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#137A70"
                    strokeWidth={2.5}
                    fill="url(#revenueFill)"
                    dot={{ r: 4, fill: '#137A70', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-sm font-semibold text-navy-950">Kondisi Armada</h2>
            <p className="mt-0.5 text-xs text-navy-900/40">Distribusi status {kondisiTotal} unit alat</p>
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <div className="space-y-3">
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-full" />
              </div>
            ) : Object.keys(kondisiBreakdown).length === 0 ? (
              <EmptyMini text="Belum ada data alat." />
            ) : (
              <>
                <div className="mb-5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  {Object.entries(kondisiBreakdown).map(([kondisi, count]) => (
                    <div
                      key={kondisi}
                      style={{
                        width: `${(count / kondisiTotal) * 100}%`,
                        backgroundColor: KONDISI_META[kondisi]?.color || '#B8C0CC',
                      }}
                      title={`${kondisi}: ${count}`}
                    />
                  ))}
                </div>
                <ul className="space-y-3">
                  {Object.entries(kondisiBreakdown).map(([kondisi, count]) => (
                    <li key={kondisi} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-navy-900/70">
                        <span
                          className="h-2 w-2 flex-none rounded-full"
                          style={{ backgroundColor: KONDISI_META[kondisi]?.color || '#B8C0CC' }}
                        />
                        {KONDISI_META[kondisi]?.label || kondisi}
                      </span>
                      <span className="font-mono text-sm font-semibold text-navy-950">{count}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link
              to="/alat"
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline"
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
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 pl-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-gradient" />
          <p className="text-sm font-semibold text-amber-800">
            {stats.belumLunasCount} tagihan belum lunas senilai {formatRupiah(stats.belumLunasTotal)}
          </p>
          {stats.belumDitagihCount > 0 && (
            <p className="mt-1 text-xs font-medium text-red-700">
              {stats.belumDitagihCount} di antaranya belum ditagih sama sekali ({formatRupiah(stats.belumDitagihTotal)})
            </p>
          )}
          <Link to="/sewa" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline">
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

const TONE_STYLE = {
  amber: { icon: 'bg-amber-50 text-amber-600', value: 'text-amber-600', bar: 'bg-amber-gradient' },
  teal: { icon: 'bg-teal-50 text-teal-600', value: 'text-navy-950', bar: 'bg-teal-500' },
  navy: { icon: 'bg-navy-900/5 text-navy-800', value: 'text-navy-950', bar: 'bg-navy-800' },
  slate: { icon: 'bg-slate-100 text-slate-600', value: 'text-navy-950', bar: 'bg-slate-300' },
}

function StatCard({ label, value, accent, icon, tone, delta }) {
  const t = TONE_STYLE[accent ? 'amber' : tone || 'slate']
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className={`absolute inset-x-0 top-0 h-[3px] ${t.bar}`} />
      <div className="flex items-start justify-between">
        <p className="text-2xs font-bold uppercase tracking-wide text-navy-900/40">{label}</p>
        <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${t.icon}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className={`text-[26px] font-semibold tabular-nums tracking-tight leading-none ${t.value}`}>
          {value}
        </p>
        {delta !== null && delta !== undefined && (
          <span
            className={`mb-0.5 inline-flex items-center gap-0.5 text-2xs font-bold ${
              delta >= 0 ? 'text-teal-600' : 'text-red-500'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`h-2.5 w-2.5 ${delta < 0 ? 'rotate-180' : ''}`}>
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  )
}

function EmptyMini({ text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path d="M4 19h16M7 15v-4M12 15V7M17 15v-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm text-navy-900/40">{text}</p>
    </div>
  )
}

function IconCoins(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v5c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 11v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" strokeLinecap="round" />
    </svg>
  )
}
function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 11h8M8 15h8M8 19h5" strokeLinecap="round" />
    </svg>
  )
}
function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l4 3.2V16h-8z" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}
function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16 8.2a3 3 0 1 1 3.6 4.6M20 19c-.1-2.4-1.3-4.2-3.3-5.1" strokeLinecap="round" />
    </svg>
  )
}
