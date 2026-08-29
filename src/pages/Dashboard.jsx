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

  if (loading) {
    return <p className="text-sm text-navy-900/60">Memuat data&hellip;</p>
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-navy-950">Ringkasan</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Ikhtisar sewa alat berat Dinas PUPR &amp; Penataan Ruang Provinsi NTT.
        </p>
      </header>

      {errorMsg && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pendapatan Sewa" value={formatRupiah(stats.totalPendapatan)} accent />
        <StatCard label="Transaksi Sewa" value={stats.totalTransaksi} />
        <StatCard label="Alat Aktif" value={`${stats.alatAktif} / ${stats.totalAlat}`} />
        <StatCard label="Penyewa Unik" value={stats.penyewaUnik} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-navy-950">Pendapatan Sewa per Bulan</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-navy-900/50">Belum ada data transaksi.</p>
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
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Bar dataKey="total" fill="#C99A3C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-navy-950">Kondisi Armada</h2>
          <ul className="space-y-3">
            {Object.entries(kondisiBreakdown).map(([kondisi, count]) => (
              <li key={kondisi} className="flex items-center justify-between text-sm">
                <span className="text-navy-900/70">{kondisi}</span>
                <span className="font-semibold text-navy-950">{count}</span>
              </li>
            ))}
            {Object.keys(kondisiBreakdown).length === 0 && (
              <p className="text-sm text-navy-900/50">Belum ada data alat.</p>
            )}
          </ul>
          <Link
            to="/alat"
            className="mt-4 inline-block text-xs font-semibold text-navy-700 hover:underline"
          >
            Kelola data alat &rarr;
          </Link>
        </div>
      </div>

      {stats.belumLunasCount > 0 && (
        <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800">
            {stats.belumLunasCount} tagihan belum lunas senilai {formatRupiah(stats.belumLunasTotal)}
          </p>
          <Link to="/sewa" className="mt-1 inline-block text-xs font-semibold text-amber-700 hover:underline">
            Lihat daftar sewa &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-900/50">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-amber-600' : 'text-navy-950'}`}>
        {value}
      </p>
    </div>
  )
}
