-- ============================================================================
-- MIGRASI — status penagihan piutang pada tabel sewa
-- Jalankan sekali di Supabase Dashboard -> SQL Editor -> New query.
-- Aman dijalankan berkali-kali (pakai IF NOT EXISTS).
-- ============================================================================

alter table sewa add column if not exists sudah_ditagih boolean not null default false;
alter table sewa add column if not exists tanggal_ditagih date;

-- Kalau ada transaksi yang statusnya sudah "Lunas", anggap otomatis sudah
-- ditagih (supaya data lama konsisten dengan fitur baru ini).
update sewa set sudah_ditagih = true
where status_pembayaran = 'Lunas' and sudah_ditagih = false;
