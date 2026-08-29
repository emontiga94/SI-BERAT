import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatRupiah, formatDate, todayLong } from '../lib/format'

export default function CetakRekap() {
  const { state } = useLocation()
  const rows = state?.rows || []
  const filterLabel = state?.filterLabel || 'Semua data'
  const total = rows.reduce((sum, s) => sum + Number(s.jumlah_harga || 0), 0)

  if (!state) {
    return (
      <div className="p-8">
        <p className="text-sm text-navy-900/60">
          Tidak ada data untuk dicetak. Silakan buka dari halaman Rekap Sewa.
        </p>
        <Link to="/sewa" className="mt-3 inline-block text-sm text-navy-700 hover:underline">
          &larr; Kembali ke Rekap Sewa
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#F4F6F8]">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <Link to="/sewa" className="text-sm font-medium text-navy-700 hover:underline">
          &larr; Kembali
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Cetak / Simpan sebagai PDF
        </button>
      </div>

      <div
        id="print-area"
        className="mx-auto max-w-4xl bg-white px-10 py-10 font-serif text-[12.5px] leading-relaxed text-black shadow-sm print:shadow-none"
      >
        <div className="mb-1 border-b-2 border-black pb-3 text-center">
          <p className="font-bold uppercase">Pemerintah Nusa Tenggara Timur</p>
          <p className="font-bold uppercase">Dinas Pekerjaan Umum dan Penataan Ruang</p>
          <p className="text-xs">Jalan Basuki Rahmat Nomor 1 Gedung A Kantor Gubernur Pertama Telp./Fax : -</p>
          <p className="text-xs">Kupang - 85111</p>
        </div>

        <p className="mt-4 text-center text-sm font-bold uppercase underline">Rekapitulasi Sewa Alat Berat</p>
        <p className="text-center text-xs">{filterLabel}</p>

        <table className="mt-5 w-full border-collapse text-[11.5px]">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1.5">No</th>
              <th className="border border-black px-2 py-1.5">Penyewa</th>
              <th className="border border-black px-2 py-1.5">Alat</th>
              <th className="border border-black px-2 py-1.5">Periode</th>
              <th className="border border-black px-2 py-1.5">Hari</th>
              <th className="border border-black px-2 py-1.5">Jumlah Harga</th>
              <th className="border border-black px-2 py-1.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.id}>
                <td className="border border-black px-2 py-1 text-center">{i + 1}</td>
                <td className="border border-black px-2 py-1">{s.nama_penyewa}</td>
                <td className="border border-black px-2 py-1">{s.nama_alat_snapshot || '-'}</td>
                <td className="border border-black px-2 py-1">
                  {s.tanggal_mulai ? `${formatDate(s.tanggal_mulai)} s.d ${formatDate(s.tanggal_selesai)}` : s.periode || '-'}
                </td>
                <td className="border border-black px-2 py-1 text-center">{s.jumlah_hari}</td>
                <td className="border border-black px-2 py-1 text-right">{formatRupiah(s.jumlah_harga)}</td>
                <td className="border border-black px-2 py-1 text-center">{s.status_pembayaran}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-black px-2 py-4 text-center">
                  Tidak ada data pada filter ini.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="border border-black px-2 py-1.5 text-right font-bold">
                Total
              </td>
              <td className="border border-black px-2 py-1.5 text-right font-bold">{formatRupiah(total)}</td>
              <td className="border border-black px-2 py-1.5" />
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-right text-xs">Kupang, {todayLong()}</p>
      </div>
    </div>
  )
}
