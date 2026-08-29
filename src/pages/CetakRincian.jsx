import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatRupiah, formatDate, todayLong } from '../lib/format'
import { terbilang } from '../lib/terbilang'

export default function CetakRincian() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: row, error } = await supabase.from('sewa').select('*').eq('id', id).single()
      if (error) setErrorMsg(error.message)
      setData(row)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <p className="p-8 text-sm text-navy-900/60">Memuat dokumen&hellip;</p>
  if (errorMsg || !data)
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">{errorMsg || 'Data sewa tidak ditemukan.'}</p>
        <Link to="/sewa" className="mt-3 inline-block text-sm text-navy-700 hover:underline">
          &larr; Kembali ke Rekap Sewa
        </Link>
      </div>
    )

  const periodeText =
    data.tanggal_mulai && data.tanggal_selesai
      ? `${formatDate(data.tanggal_mulai)} s.d ${formatDate(data.tanggal_selesai)}`
      : data.periode || '-'

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

      <div id="print-area" className="mx-auto max-w-3xl bg-white px-10 py-10 font-serif text-[13px] leading-relaxed text-black shadow-sm print:shadow-none">
        <div className="mb-1 text-center">
          <p className="font-bold uppercase">Pemerintah Nusa Tenggara Timur</p>
          <p className="font-bold uppercase">Dinas Pekerjaan Umum dan Penataan Ruang</p>
          <p className="text-xs">Jalan Basuki Rahmat Nomor 1 Gedung A Kantor Gubernur Pertama Telp./Fax : -</p>
          <p className="text-xs">Kupang - 85111</p>
        </div>
        <hr className="my-3 border-t-2 border-black" />

        <p className="mb-4 text-center text-sm font-bold uppercase underline">Rincian Tagihan</p>

        {data.lokasi && (
          <p className="mb-1">
            <span className="font-semibold">Lokasi&nbsp;:</span> {data.lokasi}
          </p>
        )}
        <p className="mb-3 font-semibold uppercase">
          Rincian Tagihan Sewa Alat Berat {data.nama_alat_snapshot}
        </p>

        <table className="mb-1 w-full border-collapse border border-black text-[12px]">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1">No.</th>
              <th className="border border-black px-2 py-1">Nama Penyewa</th>
              <th className="border border-black px-2 py-1">Hari / Tanggal</th>
              <th className="border border-black px-2 py-1">Vol (Jumlah Hari)</th>
              <th className="border border-black px-2 py-1">Harga Satuan (Rp)</th>
              <th className="border border-black px-2 py-1">Jumlah Harga (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1 text-center">1</td>
              <td className="border border-black px-2 py-1">{data.nama_penyewa}</td>
              <td className="border border-black px-2 py-1">{periodeText}</td>
              <td className="border border-black px-2 py-1 text-center">{data.jumlah_hari}</td>
              <td className="border border-black px-2 py-1 text-right">{formatRupiah(data.harga_satuan)}</td>
              <td className="border border-black px-2 py-1 text-right">{formatRupiah(data.jumlah_harga)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="border border-black px-2 py-1 text-right font-semibold">
                Total Harga
              </td>
              <td className="border border-black px-2 py-1 text-right font-semibold">
                {formatRupiah(data.jumlah_harga)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mb-4 text-xs">
          <span className="font-semibold">Terbilang:</span> {terbilang(data.jumlah_harga)}
        </p>

        {data.nomor_referensi && (
          <p className="mb-4 text-xs">
            Catatan: Pembayaran dapat dilakukan ke Rekening Dinas PUPR Provinsi NTT melalui Rekening Kas Daerah
            pada Bank NTT dengan Nomor: {data.nomor_referensi}
          </p>
        )}

        {data.catatan && <p className="mb-4 text-xs italic">Catatan tambahan: {data.catatan}</p>}

        <div className="mt-10 flex justify-end">
          <div className="text-center">
            <p>Kupang, {todayLong()}</p>
            <p className="mb-16 mt-1">Koordinator Bengkel dan Peralatan</p>
            <p className="font-semibold underline">&nbsp;</p>
          </div>
        </div>
      </div>
    </div>
  )
}
