import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatRupiah, formatDate } from '../lib/format'
import { useAuth } from '../lib/AuthContext'

const emptyForm = {
  id: null,
  nama_penyewa: '',
  jenis_penyewa: 'Instansi',
  alat_id: '',
  nama_alat_snapshot: '',
  lokasi: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  jumlah_hari: '',
  harga_satuan: '',
  periode: '',
  nomor_referensi: '',
  status_pembayaran: 'Belum Lunas',
  catatan: '',
}

export default function Sewa() {
  const { user } = useAuth()
  const [sewa, setSewa] = useState([])
  const [alatList, setAlatList] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')

  async function loadData() {
    setLoading(true)
    const [sewaRes, alatRes] = await Promise.all([
      supabase.from('sewa').select('*').order('created_at', { ascending: false }),
      supabase.from('alat_berat').select('*').order('nama_alat', { ascending: true }),
    ])
    if (sewaRes.error) setErrorMsg(sewaRes.error.message)
    if (alatRes.error) setErrorMsg(alatRes.error.message)
    setSewa(sewaRes.data || [])
    setAlatList(alatRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({
      ...item,
      alat_id: item.alat_id || '',
      jumlah_hari: String(item.jumlah_hari ?? ''),
      harga_satuan: String(item.harga_satuan ?? ''),
      tanggal_mulai: item.tanggal_mulai || '',
      tanggal_selesai: item.tanggal_selesai || '',
    })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data sewa ini?')) return
    const { error } = await supabase.from('sewa').delete().eq('id', id)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    loadData()
  }

  function handleAlatChange(alatId) {
    const picked = alatList.find((a) => a.id === alatId)
    setForm({
      ...form,
      alat_id: alatId,
      nama_alat_snapshot: picked ? picked.nama_alat : form.nama_alat_snapshot,
      harga_satuan: picked ? String(picked.harga_per_hari) : form.harga_satuan,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')

    const payload = {
      nama_penyewa: form.nama_penyewa,
      jenis_penyewa: form.jenis_penyewa,
      alat_id: form.alat_id || null,
      nama_alat_snapshot: form.nama_alat_snapshot || null,
      lokasi: form.lokasi || null,
      tanggal_mulai: form.tanggal_mulai || null,
      tanggal_selesai: form.tanggal_selesai || null,
      jumlah_hari: Number(form.jumlah_hari || 0),
      harga_satuan: Number(form.harga_satuan || 0),
      periode: form.periode || null,
      nomor_referensi: form.nomor_referensi || null,
      status_pembayaran: form.status_pembayaran,
      catatan: form.catatan || null,
    }

    const query = form.id
      ? supabase.from('sewa').update(payload).eq('id', form.id)
      : supabase.from('sewa').insert({ ...payload, dibuat_oleh: user?.id || null })

    const { error } = await query
    setSaving(false)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setShowForm(false)
    loadData()
  }

  const filtered = useMemo(() => {
    return sewa.filter((s) => {
      const matchSearch = `${s.nama_penyewa} ${s.nama_alat_snapshot ?? ''} ${s.lokasi ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchStatus = statusFilter === 'Semua' || s.status_pembayaran === statusFilter
      return matchSearch && matchStatus
    })
  }, [sewa, search, statusFilter])

  const totalFiltered = filtered.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0)

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-950">Rekap Sewa Alat Berat</h1>
          <p className="mt-1 text-sm text-navy-900/60">Catatan transaksi sewa dan status pembayaran.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          + Tambah Sewa
        </button>
      </header>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari penyewa, alat, atau lokasi&hellip;"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
        >
          <option>Semua</option>
          <option>Lunas</option>
          <option>Belum Lunas</option>
        </select>
        <span className="ml-auto text-sm text-navy-900/60">
          Total: <span className="font-semibold text-navy-950">{formatRupiah(totalFiltered)}</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-navy-900/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Penyewa</th>
              <th className="px-4 py-3 font-semibold">Alat</th>
              <th className="px-4 py-3 font-semibold">Periode Sewa</th>
              <th className="px-4 py-3 font-semibold">Hari</th>
              <th className="px-4 py-3 font-semibold">Jumlah Harga</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-900/50">
                  Memuat data&hellip;
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-900/50">
                  Tidak ada data sewa yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-950">{s.nama_penyewa}</p>
                  <p className="text-xs text-navy-900/50">{s.jenis_penyewa}</p>
                </td>
                <td className="px-4 py-3 text-navy-900/70">{s.nama_alat_snapshot || '-'}</td>
                <td className="px-4 py-3 text-navy-900/70">
                  {s.tanggal_mulai ? `${formatDate(s.tanggal_mulai)} s.d ${formatDate(s.tanggal_selesai)}` : (s.periode || '-')}
                </td>
                <td className="px-4 py-3 font-mono text-navy-950">{s.jumlah_hari}</td>
                <td className="px-4 py-3 font-mono text-navy-950">{formatRupiah(s.jumlah_harga)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                      s.status_pembayaran === 'Lunas'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {s.status_pembayaran}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    to={`/sewa/${s.id}/cetak`}
                    className="mr-3 text-xs font-semibold text-navy-700 hover:underline"
                  >
                    Cetak
                  </Link>
                  <button
                    onClick={() => openEdit(s)}
                    className="mr-3 text-xs font-semibold text-navy-700 hover:underline"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-navy-950/40 px-4 py-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-base font-semibold text-navy-950">
              {form.id ? 'Ubah Data Sewa' : 'Tambah Transaksi Sewa'}
            </h2>

            <div className="mb-3 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Nama Penyewa</label>
                <input
                  required
                  value={form.nama_penyewa}
                  onChange={(e) => setForm({ ...form, nama_penyewa: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Jenis</label>
                <select
                  value={form.jenis_penyewa}
                  onChange={(e) => setForm({ ...form, jenis_penyewa: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                >
                  <option>Instansi</option>
                  <option>Perorangan</option>
                </select>
              </div>
            </div>

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">
              Alat (pilih dari armada, opsional)
            </label>
            <select
              value={form.alat_id}
              onChange={(e) => handleAlatChange(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            >
              <option value="">-- Tidak dari daftar armada --</option>
              {alatList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama_alat} ({formatRupiah(a.harga_per_hari)}/hari)
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">Nama Alat (tampil di cetak)</label>
            <input
              required
              value={form.nama_alat_snapshot}
              onChange={(e) => setForm({ ...form, nama_alat_snapshot: e.target.value })}
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">Lokasi</label>
            <input
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              placeholder="mis. RSUD Prof. Dr. W.Z. Johannes Kupang"
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Tanggal Mulai</label>
                <input
                  type="date"
                  value={form.tanggal_mulai}
                  onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Tanggal Selesai</label>
                <input
                  type="date"
                  value={form.tanggal_selesai}
                  onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Jumlah Hari</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={form.jumlah_hari}
                  onChange={(e) => setForm({ ...form, jumlah_hari: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Harga Satuan / Hari (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.harga_satuan}
                  onChange={(e) => setForm({ ...form, harga_satuan: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
            </div>

            {form.jumlah_hari && form.harga_satuan && (
              <p className="mb-3 text-sm text-navy-900/70">
                Jumlah Harga:{' '}
                <span className="font-semibold text-navy-950">
                  {formatRupiah(Number(form.jumlah_hari) * Number(form.harga_satuan))}
                </span>
              </p>
            )}

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Periode / No. Referensi</label>
                <input
                  value={form.periode}
                  onChange={(e) => setForm({ ...form, periode: e.target.value })}
                  placeholder="mis. Jan - Jul 2026"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Status Pembayaran</label>
                <select
                  value={form.status_pembayaran}
                  onChange={(e) => setForm({ ...form, status_pembayaran: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                >
                  <option>Belum Lunas</option>
                  <option>Lunas</option>
                </select>
              </div>
            </div>

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">Nomor Referensi Rekening</label>
            <input
              value={form.nomor_referensi}
              onChange={(e) => setForm({ ...form, nomor_referensi: e.target.value })}
              placeholder="mis. 001.01.02.001.018/7"
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              rows={2}
              className="mb-5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-navy-900/70 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
              >
                {saving ? 'Menyimpan&hellip;' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
