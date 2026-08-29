import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatRupiah, formatDate } from '../lib/format'
import { downloadCsv } from '../lib/csv'
import { useAuth } from '../lib/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal, { ModalBody, ModalFooter, FieldSection } from '../components/ui/Modal'
import { FieldLabel, TextInput, Select, Textarea, CurrencyInput } from '../components/ui/Field'
import { SkeletonTableRows } from '../components/ui/Skeleton'
import AvailabilityCalendar from '../components/AvailabilityCalendar'

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
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [sewa, setSewa] = useState([])
  const [alatList, setAlatList] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [markingId, setMarkingId] = useState(null)

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

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id) {
    setDeleting(true)
    const { error } = await supabase.from('sewa').delete().eq('id', id)
    setDeleting(false)
    setConfirmDeleteId(null)
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

  function hitungJumlahHari(mulai, selesai) {
    if (!mulai || !selesai) return null
    const d1 = new Date(mulai)
    const d2 = new Date(selesai)
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return null
    const selisih = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
    return selisih > 0 ? selisih : null
  }

  function handleTanggalChange(field, value) {
    const next = { ...form, [field]: value }
    const mulai = field === 'tanggal_mulai' ? value : form.tanggal_mulai
    const selesai = field === 'tanggal_selesai' ? value : form.tanggal_selesai
    const hari = hitungJumlahHari(mulai, selesai)
    if (hari !== null) {
      next.jumlah_hari = String(hari)
    }
    setForm(next)
  }

  const tanggalTidakValid =
    form.tanggal_mulai && form.tanggal_selesai && new Date(form.tanggal_selesai) < new Date(form.tanggal_mulai)

  const jadwalTerpakaiAlat = useMemo(() => {
    if (!form.alat_id) return []
    return sewa.filter((s) => s.alat_id === form.alat_id && s.id !== form.id)
  }, [sewa, form.alat_id, form.id])

  const bentrokJadwal = useMemo(() => {
    if (!form.alat_id || !form.tanggal_mulai || !form.tanggal_selesai || tanggalTidakValid) return null
    return jadwalTerpakaiAlat.find(
      (s) =>
        s.tanggal_mulai &&
        s.tanggal_selesai &&
        s.tanggal_mulai <= form.tanggal_selesai &&
        s.tanggal_selesai >= form.tanggal_mulai
    )
  }, [jadwalTerpakaiAlat, form.alat_id, form.tanggal_mulai, form.tanggal_selesai, tanggalTidakValid])

  async function handleSubmit(e) {
    e.preventDefault()
    if (tanggalTidakValid) {
      setErrorMsg('Tanggal selesai tidak boleh sebelum tanggal mulai.')
      return
    }
    if (bentrokJadwal) {
      setErrorMsg(
        `Alat ini sudah dibooking oleh ${bentrokJadwal.nama_penyewa} pada ${formatDate(bentrokJadwal.tanggal_mulai)} s.d ${formatDate(bentrokJadwal.tanggal_selesai)}. Pilih tanggal atau alat lain.`
      )
      return
    }
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
      const matchDateFrom = !dateFrom || (s.tanggal_mulai && s.tanggal_mulai >= dateFrom)
      const matchDateTo = !dateTo || (s.tanggal_mulai && s.tanggal_mulai <= dateTo)
      return matchSearch && matchStatus && matchDateFrom && matchDateTo
    })
  }, [sewa, search, statusFilter, dateFrom, dateTo])

  const totalFiltered = filtered.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0)

  const filterLabel = useMemo(() => {
    const parts = []
    if (dateFrom || dateTo) parts.push(`Periode ${dateFrom ? formatDate(dateFrom) : '...'} s.d ${dateTo ? formatDate(dateTo) : '...'}`)
    if (statusFilter !== 'Semua') parts.push(`Status ${statusFilter}`)
    if (search) parts.push(`Pencarian "${search}"`)
    return parts.length ? parts.join(' \u2022 ') : 'Semua data'
  }, [dateFrom, dateTo, statusFilter, search])

  async function handleTandaiDitagih(id) {
    setMarkingId(id)
    const { error } = await supabase
      .from('sewa')
      .update({ sudah_ditagih: true, tanggal_ditagih: new Date().toISOString().slice(0, 10) })
      .eq('id', id)
    setMarkingId(null)
    if (error) {
      setErrorMsg(error.message)
      return
    }
    loadData()
  }

  function handleEksporCsv() {
    downloadCsv(
      `rekap-sewa-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'nama_penyewa', label: 'Penyewa' },
        { key: 'jenis_penyewa', label: 'Jenis' },
        { key: 'nama_alat_snapshot', label: 'Alat' },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'tanggal_mulai', label: 'Tanggal Mulai' },
        { key: 'tanggal_selesai', label: 'Tanggal Selesai' },
        { key: 'periode', label: 'Periode' },
        { key: 'jumlah_hari', label: 'Jumlah Hari' },
        { key: 'harga_satuan', label: 'Harga Satuan' },
        { key: 'jumlah_harga', label: 'Jumlah Harga' },
        { key: 'status_pembayaran', label: 'Status Pembayaran' },
        { key: 'sudah_ditagih', label: 'Sudah Ditagih', format: (r) => (r.sudah_ditagih ? 'Ya' : 'Belum') },
        { key: 'nomor_referensi', label: 'Nomor Referensi' },
      ],
      filtered
    )
  }

  function handleCetakRekap() {
    navigate('/sewa/cetak-rekap', { state: { rows: filtered, filterLabel } })
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-2xs font-bold uppercase tracking-widest text-amber-700/70">Transaksi</p>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-950">Rekap Sewa Alat Berat</h1>
          <p className="mt-1.5 text-sm text-navy-900/55">Catatan transaksi sewa dan status pembayaran.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleEksporCsv} icon={<IconDownload />}>
            Ekspor CSV
          </Button>
          <Button variant="secondary" onClick={handleCetakRekap} icon={<IconPrinter />}>
            Cetak Rekap
          </Button>
          <Button onClick={openCreate} icon={<IconPlus />}>
            Tambah Sewa
          </Button>
        </div>
      </header>

      {errorMsg && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlert />
          {errorMsg}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-full max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari penyewa, alat, atau lokasi\u2026"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
          />
        </div>
        <div className="w-44">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>Semua</option>
            <option>Lunas</option>
            <option>Belum Lunas</option>
          </Select>
        </div>
        <div>
          <FieldLabel hint="periode">Dari Tanggal</FieldLabel>
          <TextInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div>
          <FieldLabel>Sampai Tanggal</FieldLabel>
          <TextInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom('')
              setDateTo('')
            }}
            className="pb-2.5 text-xs font-semibold text-navy-700 hover:underline"
          >
            Reset periode
          </button>
        )}
        <span className="ml-auto rounded-full bg-navy-900/5 px-3.5 py-1.5 text-sm text-navy-900/70">
          Total: <span className="font-mono font-semibold text-navy-950">{formatRupiah(totalFiltered)}</span>
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-2xs uppercase tracking-wide text-navy-900/45">
              <tr>
                <th className="px-4 py-3 font-semibold">Penyewa</th>
                <th className="px-4 py-3 font-semibold">Alat</th>
                <th className="px-4 py-3 font-semibold">Periode Sewa</th>
                <th className="px-4 py-3 font-semibold">Hari</th>
                <th className="px-4 py-3 font-semibold">Jumlah Harga</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <SkeletonTableRows rows={5} cols={7} />}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-navy-900/50">Tidak ada data sewa yang cocok</p>
                    <p className="mt-1 text-xs text-navy-900/35">Coba ubah kata kunci pencarian atau filter status.</p>
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-navy-950">{s.nama_penyewa}</p>
                    <p className="text-xs text-navy-900/45">{s.jenis_penyewa}</p>
                  </td>
                  <td className="px-4 py-3.5 text-navy-900/65">{s.nama_alat_snapshot || '-'}</td>
                  <td className="px-4 py-3.5 text-navy-900/65">
                    {s.tanggal_mulai ? `${formatDate(s.tanggal_mulai)} s.d ${formatDate(s.tanggal_selesai)}` : (s.periode || '-')}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-navy-950">{s.jumlah_hari}</td>
                  <td className="px-4 py-3.5 font-mono text-navy-950">{formatRupiah(s.jumlah_harga)}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={s.status_pembayaran === 'Lunas' ? 'emerald' : 'amber'}>{s.status_pembayaran}</Badge>
                    {s.status_pembayaran === 'Belum Lunas' && (
                      <p className={`mt-1 text-2xs font-medium ${s.sudah_ditagih ? 'text-navy-900/40' : 'text-red-600'}`}>
                        {s.sudah_ditagih ? 'Sudah ditagih' : 'Belum ditagih'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {s.status_pembayaran === 'Belum Lunas' && !s.sudah_ditagih && (
                        <button
                          onClick={() => handleTandaiDitagih(s.id)}
                          disabled={markingId === s.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
                          aria-label="Tandai sudah ditagih"
                          title="Tandai sudah ditagih"
                        >
                          <IconBell />
                        </button>
                      )}
                      <Link
                        to={`/sewa/${s.id}/cetak`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-50"
                        aria-label="Cetak"
                        title="Cetak"
                      >
                        <IconPrinter />
                      </Link>
                      <button
                        onClick={() => openEdit(s)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-50"
                        aria-label="Ubah"
                        title="Ubah"
                      >
                        <IconEdit />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setConfirmDeleteId(s.id)}
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
        title={form.id ? 'Ubah Data Sewa' : 'Tambah Transaksi Sewa'}
        description={form.id ? 'Perbarui detail transaksi sewa.' : 'Catat transaksi sewa alat berat baru.'}
        icon={<IconClipboard />}
        widthClass="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <ModalBody>
            <FieldSection label="Penyewa">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FieldLabel required>Nama Penyewa</FieldLabel>
                  <TextInput
                    required
                    value={form.nama_penyewa}
                    onChange={(e) => setForm({ ...form, nama_penyewa: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Jenis</FieldLabel>
                  <Select value={form.jenis_penyewa} onChange={(e) => setForm({ ...form, jenis_penyewa: e.target.value })}>
                    <option>Instansi</option>
                    <option>Perorangan</option>
                  </Select>
                </div>
              </div>
            </FieldSection>

            <FieldSection label="Alat & Lokasi">
              <div>
                <FieldLabel hint="opsional">Pilih dari Armada</FieldLabel>
                <Select value={form.alat_id} onChange={(e) => handleAlatChange(e.target.value)}>
                  <option value="">-- Tidak dari daftar armada --</option>
                  {alatList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama_alat} ({formatRupiah(a.harga_per_hari)}/hari)
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel required hint="tampil di cetak">Nama Alat</FieldLabel>
                <TextInput
                  required
                  value={form.nama_alat_snapshot}
                  onChange={(e) => setForm({ ...form, nama_alat_snapshot: e.target.value })}
                />
              </div>
              <div>
                <FieldLabel>Lokasi</FieldLabel>
                <TextInput
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  placeholder="mis. RSUD Prof. Dr. W.Z. Johannes Kupang"
                />
              </div>
            </FieldSection>

            <FieldSection label="Periode Sewa">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Tanggal Mulai</FieldLabel>
                  <TextInput
                    type="date"
                    value={form.tanggal_mulai}
                    onChange={(e) => handleTanggalChange('tanggal_mulai', e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Tanggal Selesai</FieldLabel>
                  <TextInput
                    type="date"
                    invalid={tanggalTidakValid}
                    value={form.tanggal_selesai}
                    onChange={(e) => handleTanggalChange('tanggal_selesai', e.target.value)}
                  />
                </div>
              </div>
              {tanggalTidakValid && (
                <p className="text-xs font-medium text-red-600">Tanggal selesai tidak boleh sebelum tanggal mulai.</p>
              )}
              {bentrokJadwal && (
                <p className="flex items-start gap-1.5 text-xs font-medium text-red-600">
                  <IconAlert className="mt-0.5 h-3.5 w-3.5 flex-none" />
                  Bentrok dengan sewa {bentrokJadwal.nama_penyewa} ({formatDate(bentrokJadwal.tanggal_mulai)} s.d{' '}
                  {formatDate(bentrokJadwal.tanggal_selesai)}).
                </p>
              )}
              {form.alat_id && jadwalTerpakaiAlat.length > 0 && (
                <div>
                  <FieldLabel hint="cek jadwal sebelum simpan">Kalender Ketersediaan Alat</FieldLabel>
                  <AvailabilityCalendar
                    bookings={jadwalTerpakaiAlat}
                    selectedStart={form.tanggal_mulai}
                    selectedEnd={form.tanggal_selesai}
                  />
                </div>
              )}
              <p className="text-xs leading-relaxed text-navy-900/40">
                Jumlah hari terisi otomatis dari tanggal mulai &amp; selesai &mdash; bisa diubah manual kalau perlu.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Jumlah Hari</FieldLabel>
                  <TextInput
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={form.jumlah_hari}
                    onChange={(e) => setForm({ ...form, jumlah_hari: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel required>Harga Satuan / Hari</FieldLabel>
                  <CurrencyInput
                    required
                    value={form.harga_satuan}
                    onValueChange={(v) => setForm({ ...form, harga_satuan: v })}
                  />
                </div>
              </div>
              {form.jumlah_hari && form.harga_satuan && (
                <div className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-navy-900/70">
                  Jumlah Harga:{' '}
                  <span className="font-mono font-semibold text-navy-950">
                    {formatRupiah(Number(form.jumlah_hari) * Number(form.harga_satuan))}
                  </span>
                </div>
              )}
            </FieldSection>

            <FieldSection label="Pembayaran & Administrasi">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel hint="opsional">Periode / No. Ref.</FieldLabel>
                  <TextInput
                    value={form.periode}
                    onChange={(e) => setForm({ ...form, periode: e.target.value })}
                    placeholder="mis. Jan - Jul 2026"
                  />
                </div>
                <div>
                  <FieldLabel>Status Pembayaran</FieldLabel>
                  <Select
                    value={form.status_pembayaran}
                    onChange={(e) => setForm({ ...form, status_pembayaran: e.target.value })}
                  >
                    <option>Belum Lunas</option>
                    <option>Lunas</option>
                  </Select>
                </div>
              </div>
              <div>
                <FieldLabel hint="opsional">Nomor Referensi Rekening</FieldLabel>
                <TextInput
                  value={form.nomor_referensi}
                  onChange={(e) => setForm({ ...form, nomor_referensi: e.target.value })}
                  placeholder="mis. 001.01.02.001.018/7"
                />
              </div>
              <div>
                <FieldLabel hint="opsional">Catatan</FieldLabel>
                <Textarea
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  rows={2}
                />
              </div>
            </FieldSection>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving || tanggalTidakValid}>
              {saving ? 'Menyimpan\u2026' : 'Simpan'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Hapus data sewa?"
        message="Data transaksi sewa ini akan dihapus permanen dan tidak bisa dikembalikan."
        loading={deleting}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
      />
    </div>
  )
}

function IconDownload(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
function IconPrinter(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" {...props}>
      <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" {...props}>
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 11h8M8 15h8M8 19h5" strokeLinecap="round" />
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
