-- ============================================================================
-- PEMBERSIHAN DATA DOBEL di tabel alat_berat
-- Jalankan sekali di Supabase Dashboard -> SQL Editor -> New query.
-- Aman: kalau tidak ada data dobel, skrip ini tidak mengubah apa pun.
-- ============================================================================

-- 1) Salin kategori & urutan dari baris duplikat (yang baru dibuat saat re-run
--    seed) ke baris asli (yang paling lama), supaya baris asli punya data yang
--    sudah lengkap.
with duplikat as (
  select
    id,
    nama_alat,
    kategori,
    urutan,
    row_number() over (partition by nama_alat order by created_at asc) as rn,
    count(*) over (partition by nama_alat) as jumlah
  from alat_berat
)
update alat_berat a
set
  kategori = coalesce(d_baru.kategori, a.kategori),
  urutan = coalesce(d_baru.urutan, a.urutan)
from duplikat d_lama
join duplikat d_baru
  on d_baru.nama_alat = d_lama.nama_alat
 and d_baru.rn = d_lama.rn + 1
where d_lama.rn = 1
  and d_lama.jumlah > 1
  and a.id = d_lama.id;

-- 2) Hapus semua baris duplikat (yang dibuat setelah baris pertama untuk
--    nama alat yang sama). Baris pertama (paling lama) yang dipertahankan.
with duplikat as (
  select
    id,
    nama_alat,
    row_number() over (partition by nama_alat order by created_at asc) as rn,
    count(*) over (partition by nama_alat) as jumlah
  from alat_berat
)
delete from alat_berat
where id in (
  select id from duplikat where rn > 1 and jumlah > 1
);

-- 3) Cek hasilnya — harus tidak ada nama_alat yang muncul lebih dari 1 kali.
select nama_alat, count(*) from alat_berat group by nama_alat having count(*) > 1;
