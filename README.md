# Sistem Guru

**Semua Administrasi Guru, Dalam Satu Aplikasi.**

Sistem Guru adalah aplikasi web modern terintegrasi yang dirancang khusus untuk mempermudah tugas administrasi guru. Aplikasi ini menggabungkan fitur pengelolaan kelas, absensi, jurnal mengajar, perangkat pembelajaran, bahan ajar, dan penilaian dalam satu dashboard terpadu.

## 🚀 Fitur Utama

- **Dashboard Terintegrasi**: Gambaran statistik kelas, siswa, jadwal, dan akses cepat.
- **Manajemen Kelas & Siswa**: Kelola data siswa dengan mudah (tambah, edit, import/export Excel).
- **Absensi Cepat**: Fitur absensi yang didesain untuk kecepatan dengan satu klik ("Hadir Semua").
- **Jurnal Mengajar**: Catat materi, tujuan pembelajaran, dan kendala di setiap pertemuan.
- **Manajemen Perangkat & Bahan Ajar**: Upload dan kelola Modul Ajar, ATP, CP, serta bahan ajar digital.
- **Sistem Penilaian**: Input nilai tugas, kuis, UTS, UAS dengan kalkulasi otomatis.
- **Halaman Pertemuan (Meeting Center)**: Satu halaman khusus per pertemuan yang memuat tab Absensi, Jurnal, Materi, Penilaian, dan Catatan.
- **Dokumen Center**: Ruang penyimpanan dokumen administrasi terpusat.

## 💻 Teknologi yang Digunakan

- **Frontend**: Next.js 14/15 (App Router), React, TypeScript
- **Styling & UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Database & Backend**: Supabase (PostgreSQL), Supabase Auth, Row Level Security (RLS)
- **Deployment**: Vercel
- **Lainnya**: Recharts (Grafik), PWA Support

## 🛠️ Cara Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/pallakawe/Sistem-Guru.git
   cd Sistem-Guru
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Buat file `.env.local`:**
   Duplikat file `.env.example` menjadi `.env.local` dan isi dengan kredensial Supabase Anda (lihat bagian Environment Variables).

4. **Jalankan development server:**
   ```bash
   npm run dev
   ```

5. **Buka di browser:**
   Akses `http://localhost:3000`.

## 🗄️ Cara Membuat Supabase & Database

1. Buat akun dan project baru di [Supabase](https://supabase.com).
2. Setelah project terbuat, masuk ke menu **SQL Editor**.
3. Buka file `supabase/schema.sql` di repository ini.
4. Copy seluruh isi file tersebut dan paste ke SQL Editor di Supabase.
5. Klik **Run** untuk membuat semua tabel, relasi, dan kebijakan Row Level Security (RLS).
6. Untuk mengatur **Storage**, masuk ke menu **Storage** di Supabase, lalu buat bucket baru (misal: `teacher-documents` dan `learning-materials`). Atur public access sesuai kebutuhan.

## 🔑 Environment Variables

Berikut adalah variabel environment yang dibutuhkan:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Anda dapat menemukan nilai ini di dashboard Supabase pada menu **Settings > API**.

## ☁️ Cara Deployment ke Vercel

1. Buat akun di [Vercel](https://vercel.com) dan hubungkan dengan akun GitHub Anda.
2. Klik **Add New...** > **Project**.
3. Import repository `Sistem-Guru` dari GitHub.
4. Di bagian **Environment Variables**, tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Klik **Deploy**.
6. Vercel akan otomatis melakukan build dan deploy aplikasi Anda.

## 📁 Struktur Project

```
├── public/                 # Aset statis (ikon PWA, gambar)
├── src/
│   ├── app/                # Route Next.js (Pages, Layouts, API)
│   │   ├── dashboard/      # Halaman utama aplikasi setelah login
│   │   ├── login/          # Halaman autentikasi
│   │   └── globals.css     # Tailwind & Global styles
│   ├── components/         # Komponen UI (shadcn/ui & custom)
│   ├── lib/                # Konfigurasi utility & Supabase client
│   └── hooks/              # Custom React hooks
├── supabase/               # File konfigurasi Supabase (schema.sql)
├── next.config.ts          # Konfigurasi Next.js
├── tailwind.config.ts      # Konfigurasi Tailwind CSS
└── package.json            # Daftar dependensi & scripts
```
