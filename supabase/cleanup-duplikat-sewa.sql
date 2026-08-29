-- ============================================================================
-- PEMBERSIHAN DATA DOBEL di tabel sewa (penyebab Total Pendapatan Sewa 2x lipat)
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- LANGKAH 1 (WAJIB DICEK DULU) — lihat baris mana saja yang dianggap dobel.
-- Dua baris dianggap "sama" kalau nama penyewa, alat, lokasi, tanggal,
-- jumlah hari, harga satuan, periode, dan nomor referensinya identik.
-- Jalankan query ini dulu dan periksa hasilnya SEBELUM menjalankan DELETE
-- di Langkah 2 — pastikan ini memang data dobel, bukan 2 transaksi asli
-- yang kebetulan miliki nilai sama.
-- ----------------------------------------------------------------------------
select
  nama_penyewa, nama_alat_snapshot, lokasi, tanggal_mulai, tanggal_selesai,
  jumlah_hari, harga_satuan, periode, nomor_referensi,
  count(*) as jumlah_baris,
  sum(jumlah_harga) as total_kalau_dihitung_semua,
  min(jumlah_harga) as seharusnya_hanya_ini
from sewa
group by
  nama_penyewa, nama_alat_snapshot, lokasi, tanggal_mulai, tanggal_selesai,
  jumlah_hari, harga_satuan, periode, nomor_referensi
having count(*) > 1
order by count(*) desc;

-- ----------------------------------------------------------------------------
-- LANGKAH 2 — hapus baris duplikat, sisakan baris paling lama (created_at
-- paling awal) untuk tiap kombinasi data yang sama persis di atas.
-- Aman: kalau tidak ada data dobel, skrip ini tidak mengubah apa pun.
-- ----------------------------------------------------------------------------
with duplikat as (
  select
    id,
    row_number() over (
      partition by
        nama_penyewa, nama_alat_snapshot, lokasi, tanggal_mulai, tanggal_selesai,
        jumlah_hari, harga_satuan, periode, nomor_referensi
      order by created_at asc
    ) as rn,
    count(*) over (
      partition by
        nama_penyewa, nama_alat_snapshot, lokasi, tanggal_mulai, tanggal_selesai,
        jumlah_hari, harga_satuan, periode, nomor_referensi
    ) as jumlah
  from sewa
)
delete from sewa
where id in (
  select id from duplikat where rn > 1 and jumlah > 1
);

-- ----------------------------------------------------------------------------
-- LANGKAH 3 — cek hasilnya: query ini harus tidak mengembalikan baris apa pun.
-- ----------------------------------------------------------------------------
select
  nama_penyewa, nama_alat_snapshot, tanggal_mulai, tanggal_selesai,
  jumlah_hari, harga_satuan, count(*)
from sewa
group by nama_penyewa, nama_alat_snapshot, tanggal_mulai, tanggal_selesai, jumlah_hari, harga_satuan
having count(*) > 1;

-- ----------------------------------------------------------------------------
-- LANGKAH 4 — bandingkan total pendapatan sekarang dengan rekap Excel Anda.
-- ----------------------------------------------------------------------------
select sum(jumlah_harga) as total_pendapatan_sekarang from sewa;
