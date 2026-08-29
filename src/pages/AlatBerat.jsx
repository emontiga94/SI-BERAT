import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatRupiah } from '../lib/format'
import { useAuth } from '../lib/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal, { ModalBody, ModalFooter, FieldSection } from '../components/ui/Modal'
import { FieldLabel, TextInput, Select, CurrencyInput } from '../components/ui/Field'
import { SkeletonTableRows } from '../components/ui/Skeleton'

const KONDISI_OPTIONS = [
  'Aktif',
  'Aktif / Lainnya',
  'Tidak Aktif / Rusak Ringan',
  'Tidak Aktif / Rusak Berat',
  'Tidak Ada',
]

const KONDISI_TONE = {
  Aktif: 'emerald',
  'Aktif / Lainnya': 'emerald',
  'Tidak Aktif / Rusak Ringan': 'amber',
  'Tidak Aktif / Rusak Berat': 'red',
  'Tidak Ada': 'slate',
}

const KONDISI_ROW_TINT = {
  Aktif: '',
  'Aktif / Lainnya': '',
  'Tidak Aktif / Rusak Ringan': 'bg-amber-50/40',
  'Tidak Aktif / Rusak Berat': 'bg-red-50/50',
  'Tidak Ada': 'bg-slate-50',
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
  const { isAdmin } = useAuth()
  const [alat, setAlat] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [kondisiFilter, setKondisiFilter] = useState('Semua')

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

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id) {
    setDeleting(true)
    const { error } = await supabase.from('alat_berat').delete().eq('id', id)
    setDeleting(false)
    setConfirmDeleteId(null)
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

  const filtered = alat.filter((a) => {
    const matchSearch = `${a.nama_alat} ${a.kategori ?? ''} ${a.kode ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchKondisi = kondisiFilter === 'Semua' || a.kondisi === kondisiFilter
    return matchSearch && matchKondisi
  })

  const kategoriOptions = [...new Set(alat.map((a) => a.kategori).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-2xs font-bold uppercase tracking-widest text-amber-700/70">Armada</p>
          <h1 className="text-[26px] font-semibold tracking-tight text-navy-950">Data Alat Berat</h1>
          <p className="mt-1.5 text-sm text-navy-900/50">
            Daftar armada alat berat beserta tarif sewa harian dan kondisi terkini.
          </p>
        </div>
        <Button onClick={openCreate} icon={<IconPlus />}>
          Tambah Alat
        </Button>
      </header>

      {errorMsg && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlert />
          {errorMsg}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama alat atau kategori\u2026"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          />
        </div>
        <div className="w-44">
          <Select value={kondisiFilter} onChange={(e) => setKondisiFilter(e.target.value)}>
            <option>Semua</option>
            {KONDISI_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        </div>
        <span className="ml-auto text-xs font-medium text-navy-900/40">
          {filtered.length} dari {alat.length} alat
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-2xs uppercase tracking-wide text-navy-900/40">
              <tr>
                <th className="px-5 py-3.5 font-bold">Nama Alat</th>
                <th className="px-5 py-3.5 font-bold">Kategori</th>
                <th className="px-5 py-3.5 font-bold">Harga / Hari</th>
                <th className="px-5 py-3.5 font-bold">Kondisi</th>
                <th className="px-5 py-3.5 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <SkeletonTableRows rows={5} cols={5} />}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <IconSearch className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-navy-900/50">Tidak ada data alat yang cocok</p>
                    <p className="mt-1 text-xs text-navy-900/35">Coba ubah kata kunci pencarian atau filter kondisi.</p>
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className={`group transition-colors hover:bg-teal-50/30 ${KONDISI_ROW_TINT[a.kondisi] || ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-navy-900/5 text-navy-700">
                        <IconTool className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy-950">
                          {a.kode ? <span className="mr-1 font-normal text-navy-900/35">{a.kode}.</span> : null}
                          {a.nama_alat}
                        </p>
                        {a.keterangan && <p className="truncate text-xs font-normal text-navy-900/40">{a.keterangan}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {a.kategori ? (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-navy-900/60">
                        {a.kategori}
                      </span>
                    ) : (
                      <span className="text-navy-900/30">&mdash;</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono tabular-nums text-navy-950">{formatRupiah(a.harga_per_hari)}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={KONDISI_TONE[a.kondisi] || 'slate'}>{a.kondisi}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(a)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-50"
                        aria-label="Ubah"
                        title="Ubah"
                      >
                        <IconEdit />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setConfirmDeleteId(a.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                          aria-label="Hapus"
                          title="Hapus"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={form.id ? 'Ubah Data Alat' : 'Tambah Alat Baru'}
        description={form.id ? 'Perbarui informasi armada alat berat.' : 'Lengkapi data untuk menambah armada baru.'}
        icon={<IconTruck />}
        widthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <ModalBody>
            <FieldSection label="Identitas Alat">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <FieldLabel hint="opsional">Kode</FieldLabel>
                  <TextInput value={form.kode || ''} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
                </div>
                <div>
                  <FieldLabel hint="mis. 10">Urutan</FieldLabel>
                  <TextInput
                    type="number"
                    step="1"
                    value={form.urutan}
                    onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Kategori</FieldLabel>
                  <TextInput
                    list="kategori-options"
                    value={form.kategori || ''}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    placeholder="pilih/ketik"
                  />
                  <datalist id="kategori-options">
                    {kategoriOptions.map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-navy-900/40">
                Urutan tampil menentukan posisi alat di daftar (angka kecil tampil lebih dulu).
              </p>

              <div>
                <FieldLabel required>Nama Alat</FieldLabel>
                <TextInput
                  required
                  value={form.nama_alat}
                  onChange={(e) => setForm({ ...form, nama_alat: e.target.value })}
                />
              </div>
            </FieldSection>

            <FieldSection label="Tarif & Kondisi">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Harga / Hari</FieldLabel>
                  <CurrencyInput
                    required
                    value={form.harga_per_hari}
                    onValueChange={(v) => setForm({ ...form, harga_per_hari: v })}
                  />
                </div>
                <div>
                  <FieldLabel>Kondisi</FieldLabel>
                  <Select value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })}>
                    {KONDISI_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </FieldSection>

            <FieldSection label="Catatan">
              <div>
                <FieldLabel hint="opsional">Keterangan</FieldLabel>
                <TextInput
                  value={form.keterangan || ''}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="mis. Di Sekretariat"
                />
              </div>
            </FieldSection>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan\u2026' : 'Simpan'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Hapus data alat?"
        message="Riwayat sewa yang tertaut tidak akan terhapus, tapi data alat ini akan hilang permanen."
        loading={deleting}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
      />
    </div>
  )
}

function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  )
}
function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" {...props}>
      <path d="M2 7h11v9H2z" />
      <path d="M13 10h4l4 3.2V16h-8z" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}
function IconTool(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.65 2.65a1.5 1.5 0 0 1-2.1-2.1L14.7 6.3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconAlert(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 flex-none" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  )
}
