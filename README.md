# SIMSEWA — Aplikasi Sewa Alat Berat
Dinas Pekerjaan Umum dan Penataan Ruang Provinsi Nusa Tenggara Timur

Aplikasi web untuk mengelola data alat berat, mencatat transaksi sewa, memantau
status pembayaran, dan mencetak "Rincian Tagihan" — dibangun dari data pada
`REKAP_SEWA_ALAT_BERAT_PERIODE_JANUARI_SD_JULI_2026.xlsx` dan
`DAFTAR_ALAT_BERAT_082616.xls`.

**Tumpukan teknologi:** React + Vite, Tailwind CSS, Supabase (Database, Auth, RLS).

---

## 1. Fitur

- **Login admin** menggunakan Supabase Auth (email & kata sandi).
- **Ringkasan/Dashboard**: total pendapatan, jumlah transaksi, alat aktif, penyewa
  unik, grafik pendapatan per bulan, dan status kondisi armada.
- **Data Alat Berat**: tambah/ubah/hapus alat, tarif per hari, dan status kondisi
  (Aktif, Rusak Ringan, Rusak Berat, Tidak Ada).
- **Rekap Sewa**: tambah/ubah/hapus transaksi sewa, filter status pembayaran &
  pencarian, jumlah harga terhitung otomatis (hari × harga satuan).
- **Cetak / Export PDF**: halaman cetak per transaksi yang meniru format
  "Rincian Tagihan" resmi (kop surat, tabel, terbilang, catatan rekening) —
  gunakan tombol *Cetak / Simpan sebagai PDF* (Print to PDF bawaan browser).

---

## 2. Menyiapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (gratis untuk mulai).
2. Buka **SQL Editor** → **New query**, lalu salin-tempel seluruh isi file
   [`supabase/schema.sql`](./supabase/schema.sql) dan jalankan (**Run**).
   Ini akan membuat tabel `alat_berat` & `sewa`, mengaktifkan Row Level
   Security, dan mengisi data awal dari kedua file Excel Anda.
3. Buka **Authentication → Users → Add user**, buat akun admin (email +
   kata sandi) untuk login ke aplikasi. Anda bisa menambah beberapa akun
   staf sesuai kebutuhan.
4. Buka **Project Settings → API**, salin nilai **Project URL** dan
   **anon public key** — Anda akan membutuhkannya di langkah berikut.

> Data hanya bisa dibaca/diubah oleh pengguna yang sudah login (RLS
> `auth.role() = 'authenticated'`). Jika ingin sebagian data bisa diakses
> publik tanpa login, sesuaikan kebijakan di `supabase/schema.sql`.

---

## 3. Menjalankan aplikasi secara lokal

Pastikan [Node.js](https://nodejs.org) (versi 18+) sudah terpasang.

```bash
# 1. Masuk ke folder project
cd simsewa-alat-berat

# 2. Install dependencies
npm install

# 3. Salin file environment lalu isi kredensial Supabase Anda
cp .env.example .env
# buka .env dan isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY

# 4. Jalankan aplikasi
npm run dev
```

Buka `http://localhost:5173`, lalu login menggunakan akun admin yang dibuat
di langkah Supabase sebelumnya.

---

## 4. Mengunggah ke GitHub

```bash
cd simsewa-alat-berat
git init
git add .
git commit -m "Inisialisasi aplikasi SIMSEWA Alat Berat"

# Buat repo baru di GitHub (lewat web github.com/new), lalu:
git branch -M main
git remote add origin https://github.com/<username-anda>/<nama-repo>.git
git push -u origin main
```

File `.env` **tidak** akan ikut terunggah (sudah ada di `.gitignore`) sehingga
kredensial Supabase Anda tetap aman.

---

## 5. Deploy ke hosting (opsional)

Cara termudah adalah lewat **Vercel** atau **Netlify**, keduanya gratis untuk
proyek seperti ini dan terhubung langsung ke repo GitHub Anda:

1. Login ke [vercel.com](https://vercel.com) dengan akun GitHub → **Add New
   Project** → pilih repo yang baru dibuat.
2. Saat konfigurasi, tambahkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Klik **Deploy**. Setiap kali Anda `git push`, Vercel akan build ulang
   otomatis.

---

## 6. Struktur folder

```
simsewa-alat-berat/
├─ supabase/
│  └─ schema.sql          # skema tabel, RLS, dan data awal
├─ src/
│  ├─ components/         # Layout (sidebar), ProtectedRoute
│  ├─ lib/                # AuthContext, format Rupiah/tanggal, terbilang
│  ├─ pages/               # Login, Dashboard, AlatBerat, Sewa, CetakRincian
│  ├─ App.jsx               # routing
│  └─ supabaseClient.js    # koneksi ke Supabase
├─ .env.example
└─ index.html
```

---

## 7. Menambah pengguna staf baru

Tambahkan lewat **Supabase Dashboard → Authentication → Users → Add user**.
Aplikasi ini belum memiliki halaman pendaftaran mandiri (self sign-up) —
by design, karena data keuangan sewa alat berat sebaiknya hanya dikelola
oleh akun yang dibuat langsung oleh administrator.
