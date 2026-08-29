import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatRupiah } from '../lib/format'

const KONDISI_OPTIONS = [
  'Aktif',
  'Aktif / Lainnya',
  'Tidak Aktif / Rusak Ringan',
  'Tidak Aktif / Rusak Berat',
  'Tidak Ada',
]

const KONDISI_STYLES = {
  Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Aktif / Lainnya': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Tidak Aktif / Rusak Ringan': 'bg-amber-50 text-amber-700 border-amber-200',
  'Tidak Aktif / Rusak Berat': 'bg-red-50 text-red-700 border-red-200',
  'Tidak Ada': 'bg-slate-100 text-slate-600 border-slate-200',
}

const emptyForm = {
  id: null,
  kode: '',
  urutan: '',
  nama_alat: '',
  kategori: '',
  harga_per_hari: '',
  kondisi: 'Aktif',
  keterangan: '',
}

export default function AlatBerat() {
  const [alat, setAlat] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  async function loadAlat() {
    setLoading(true)
    const { data, error } = await supabase
      .from('alat_berat')
      .select('*')
      .order('urutan', { ascending: true, nullsFirst: false })
      .order('nama_alat', { ascending: true })
    if (error) setErrorMsg(error.message)
    setAlat(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAlat()
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({
      ...item,
      harga_per_hari: String(item.harga_per_hari ?? ''),
      urutan: item.urutan === null || item.urutan === undefined ? '' : String(item.urutan),
    })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data alat ini? Riwayat sewa yang tertaut tidak akan terhapus.')) return
    const { error } = await supabase.from('alat_berat').delete().eq('id', id)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    loadAlat()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')

    const payload = {
      kode: form.kode || null,
      urutan: form.urutan === '' ? null : Number(form.urutan),
      nama_alat: form.nama_alat,
      kategori: form.kategori || null,
      harga_per_hari: Number(form.harga_per_hari || 0),
      kondisi: form.kondisi,
      keterangan: form.keterangan || null,
    }

    const query = form.id
      ? supabase.from('alat_berat').update(payload).eq('id', form.id)
      : supabase.from('alat_berat').insert(payload)

    const { error } = await query
    setSaving(false)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    setShowForm(false)
    loadAlat()
  }

  const filtered = alat.filter((a) =>
    `${a.nama_alat} ${a.kategori ?? ''} ${a.kode ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const kategoriOptions = [...new Set(alat.map((a) => a.kategori).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-950">Data Alat Berat</h1>
          <p className="mt-1 text-sm text-navy-900/60">
            Daftar armada alat berat beserta tarif sewa harian dan kondisi terkini.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          + Tambah Alat
        </button>
      </header>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama alat atau kategori&hellip;"
        className="mb-4 w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-navy-900/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Alat</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Harga / Hari</th>
              <th className="px-4 py-3 font-semibold">Kondisi</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-navy-900/50">
                  Memuat data&hellip;
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-navy-900/50">
                  Tidak ada data alat yang cocok.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-navy-950">
                  {a.kode ? <span className="mr-1 text-navy-900/40">{a.kode}.</span> : null}
                  {a.nama_alat}
                  {a.keterangan && <p className="text-xs font-normal text-navy-900/50">{a.keterangan}</p>}
                </td>
                <td className="px-4 py-3 text-navy-900/70">{a.kategori || '-'}</td>
                <td className="px-4 py-3 font-mono text-navy-950">{formatRupiah(a.harga_per_hari)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                      KONDISI_STYLES[a.kondisi] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {a.kondisi}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(a)}
                    className="mr-3 text-xs font-semibold text-navy-700 hover:underline"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
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
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-navy-950/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-base font-semibold text-navy-950">
              {form.id ? 'Ubah Data Alat' : 'Tambah Alat Baru'}
            </h2>

            <div className="mb-3 grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Kode</label>
                <input
                  value={form.kode || ''}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                  placeholder="opsional"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Urutan Tampil</label>
                <input
                  type="number"
                  step="1"
                  value={form.urutan}
                  onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                  placeholder="mis. 10"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Kategori</label>
                <input
                  list="kategori-options"
                  value={form.kategori || ''}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                  placeholder="pilih atau ketik baru"
                />
                <datalist id="kategori-options">
                  {kategoriOptions.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </div>
            </div>
            <p className="mb-3 -mt-2 text-xs text-navy-900/50">
              Urutan tampil menentukan posisi alat di daftar (angka kecil tampil lebih dulu). Alat dengan urutan
              sama akan diurutkan berdasarkan nama.
            </p>

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">Nama Alat</label>
            <input
              required
              value={form.nama_alat}
              onChange={(e) => setForm({ ...form, nama_alat: e.target.value })}
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Harga / Hari (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.harga_per_hari}
                  onChange={(e) => setForm({ ...form, harga_per_hari: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy-900/70">Kondisi</label>
                <select
                  value={form.kondisi}
                  onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                >
                  {KONDISI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mb-1 block text-xs font-semibold text-navy-900/70">Keterangan</label>
            <input
              value={form.keterangan || ''}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="mis. Di Sekretariat"
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
