-- ============================================================================
-- SIMSEWA — Sewa Alat Berat, Dinas PUPR & Penataan Ruang Provinsi NTT
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tabel: alat_berat  (master data armada, dari "DAFTAR ALAT BERAT")
-- ----------------------------------------------------------------------------
create table if not exists alat_berat (
  id uuid primary key default gen_random_uuid(),
  kode text,
  urutan integer,
  nama_alat text not null,
  kategori text,
  harga_per_hari numeric(15,2) not null default 0,
  kondisi text not null default 'Aktif'
    check (kondisi in (
      'Aktif',
      'Aktif / Lainnya',
      'Tidak Aktif / Rusak Ringan',
      'Tidak Aktif / Rusak Berat',
      'Tidak Ada'
    )),
  keterangan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kalau tabel alat_berat sudah ada sebelumnya (dibuat sebelum kolom urutan
-- ditambahkan), baris di bawah ini menambahkan kolomnya tanpa mengubah data.
alter table alat_berat add column if not exists urutan integer;

-- Isi urutan awal untuk baris lama yang sudah ada di database (kalau kode-nya
-- persis angka, mis. '1'..'15'). Baris dengan kode campuran huruf (mis. '4a')
-- atau kode kosong perlu diisi manual lewat form "Ubah" di aplikasi.
update alat_berat
set urutan = (kode::integer) * 10
where urutan is null and kode ~ '^[0-9]+$';

-- ----------------------------------------------------------------------------
-- Tabel: sewa  (transaksi sewa, dari "REKAP SEWA ALAT BERAT")
-- ----------------------------------------------------------------------------
create table if not exists sewa (
  id uuid primary key default gen_random_uuid(),
  nama_penyewa text not null,
  jenis_penyewa text not null default 'Instansi'
    check (jenis_penyewa in ('Instansi', 'Perorangan')),
  alat_id uuid references alat_berat(id) on delete set null,
  nama_alat_snapshot text,
  lokasi text,
  tanggal_mulai date,
  tanggal_selesai date,
  jumlah_hari numeric(10,2) not null default 0,
  harga_satuan numeric(15,2) not null default 0,
  jumlah_harga numeric(15,2) generated always as (jumlah_hari * harga_satuan) stored,
  periode text,
  nomor_referensi text,
  status_pembayaran text not null default 'Belum Lunas'
    check (status_pembayaran in ('Lunas', 'Belum Lunas')),
  catatan text,
  dibuat_oleh uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sewa_alat_id on sewa(alat_id);
create index if not exists idx_sewa_periode on sewa(periode);
create index if not exists idx_sewa_status on sewa(status_pembayaran);

-- ----------------------------------------------------------------------------
-- Trigger updated_at
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_alat_berat_updated_at on alat_berat;
create trigger trg_alat_berat_updated_at
  before update on alat_berat
  for each row execute function set_updated_at();

drop trigger if exists trg_sewa_updated_at on sewa;
create trigger trg_sewa_updated_at
  before update on sewa
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security — hanya pengguna yang login (admin/staf) yang boleh
-- membaca dan mengubah data. Sesuaikan bila Anda ingin sebagian data publik.
-- ----------------------------------------------------------------------------
alter table alat_berat enable row level security;
alter table sewa enable row level security;

drop policy if exists "read alat_berat" on alat_berat;
create policy "read alat_berat" on alat_berat
  for select using (auth.role() = 'authenticated');

drop policy if exists "insert alat_berat" on alat_berat;
create policy "insert alat_berat" on alat_berat
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "update alat_berat" on alat_berat;
create policy "update alat_berat" on alat_berat
  for update using (auth.role() = 'authenticated');

drop policy if exists "delete alat_berat" on alat_berat;
create policy "delete alat_berat" on alat_berat
  for delete using (auth.role() = 'authenticated');

drop policy if exists "read sewa" on sewa;
create policy "read sewa" on sewa
  for select using (auth.role() = 'authenticated');

drop policy if exists "insert sewa" on sewa;
create policy "insert sewa" on sewa
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "update sewa" on sewa;
create policy "update sewa" on sewa
  for update using (auth.role() = 'authenticated');

drop policy if exists "delete sewa" on sewa;
create policy "delete sewa" on sewa
  for delete using (auth.role() = 'authenticated');

-- ============================================================================
-- SEED DATA — diambil dari file DAFTAR_ALAT_BERAT_082616.xls
-- (harga berdasarkan Perda NTT No. 1 Tahun 2024)
-- ============================================================================
insert into alat_berat (kode, urutan, nama_alat, kategori, harga_per_hari, kondisi, keterangan) values
  ('1',  10,  'Buldozer Merk Caterpillar',                              'Alat Berat',        3400000,  'Tidak Aktif / Rusak Berat', null),
  ('2',  20,  'Motor Grader',                                           'Alat Berat',        0,        'Tidak Ada', null),
  ('3',  30,  'Loader On Wheel',                                        'Alat Berat',        2000000,  'Aktif', null),
  ('4a', 40,  'Merk Komatshu GD 31 rca',                                'Excavator Bucket',  1912500,  'Aktif', null),
  ('4b', 41,  'Merk Caterpillar 3298',                                  'Excavator Bucket',  2550000,  'Tidak Aktif / Rusak Berat', null),
  ('4c', 42,  'Merk Komatshu PC 200',                                   'Excavator Bucket',  2550000,  'Aktif', null),
  ('5',  50,  'Excavator Breaker Caterpilar 926',                       'Alat Berat',        3570000,  'Aktif', null),
  ('6',  60,  'Vibrator Roller Merk Bomag Single Drum BW 211D-40',      'Alat Berat',        2125000,  'Aktif', null),
  ('7',  70,  'Thandem Roller Merk Bomag BW 100 AD-5',                  'Alat Berat',        1275000,  'Aktif', null),
  ('8',  80,  'Tire Roller Merk Sakai TS-7409',                         'Alat Berat',        1487500,  'Tidak Ada', null),
  ('9',  90,  'Sheep Foot Roller Merk Ingersoll Rand SP.48',            'Alat Berat',        1275000,  'Tidak Ada', null),
  ('10', 100, 'Trailer/Tronton Merk Nissan Diesel RD 80',                'Alat Berat',        2125000,  'Aktif', null),
  ('11', 110, 'Mobil Tangki',                                            'Alat Berat',        637500,   'Aktif / Lainnya', 'Di Sekretariat'),
  ('12', 120, 'Track Loader',                                            'Alat Berat',        2125000,  'Tidak Ada', null),
  ('13', 130, 'Dump Truck',                                              'Alat Berat',        425000,   'Aktif / Lainnya', 'Di Laboratorium'),
  ('14', 140, 'Truck Crane',                                             'Alat Berat',        1700000,  'Tidak Aktif / Rusak Ringan', null),
  ('15', 150, 'Mini Excavator',                                          'Alat Berat',        1500000,  'Aktif', null);

-- ============================================================================
-- SEED DATA — diambil dari file REKAP_SEWA_ALAT_BERAT_PERIODE_JANUARI_SD_JULI_2026.xlsx
-- ============================================================================
insert into sewa
  (nama_penyewa, jenis_penyewa, nama_alat_snapshot, lokasi, tanggal_mulai, tanggal_selesai,
   jumlah_hari, harga_satuan, periode, nomor_referensi, status_pembayaran)
values
  ('RSUD W.Z Johannes Kupang', 'Instansi', 'Excavator Komathsu PC 210',
   'RSUD. Prof.Dr.W.Z. Johannes Kupang', '2026-04-29', '2026-05-15',
   14, 2550000, 'Januari - Juli 2026', '001.01.02.001.018/7', 'Lunas'),

  ('Muksin', 'Perorangan', 'Excavator Mini Merek Komathsu',
   'RSUD. Prof.Dr.W.Z. Johannes Kupang', '2026-04-17', '2026-04-29',
   10, 1500000, 'Januari - Juli 2026', '001.01.02.001.018/7', 'Lunas'),

  ('Yohanes Baptista Sama Lau Manek', 'Perorangan', 'Excavator Komathsu PC 210 Bucket',
   null, null, null,
   4, 3570000, 'Januari - Juli 2026', null, 'Belum Lunas'),

  ('Yohanes Baptista Sama Lau Manek', 'Perorangan', 'Excavator Komathsu PC 210 Breaker',
   null, null, null,
   4, 2550000, 'Januari - Juli 2026', null, 'Belum Lunas');

-- ============================================================================
-- Selesai. Total 4 transaksi seed di atas = Rp 75.180.000
-- (sesuai Total Harga pada REKAPITULASI SEWA ALAT BERAT PERIODE JAN-JUL 2026)
-- ============================================================================
