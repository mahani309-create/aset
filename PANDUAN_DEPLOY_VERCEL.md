# Panduan Deploy Online ke Vercel (Database Terpusat di Google Drive)

Aplikasi **SIM Sarpras SMP** dirancang secara khusus untuk dapat di-hosting secara publik/online melalui **Vercel** dengan arsitektur **Master Database Terpusat di Google Drive**. 

Ini memungkinkan kepala sekolah, operator sarpras, guru, dan staf mengakses aplikasi dari mana saja secara online, sementara seluruh data (aset, ruangan, peminjaman, mutasi) tetap aman dan tersimpan di akun Google Drive resmi sekolah (@belajar.id atau Gmail).

---

## Langkah 1: Push / Unggah Proyek ke GitHub

1. Pastikan seluruh folder proyek ini telah di-upload ke repository GitHub Anda (bisa public atau private).
2. Proyek ini sudah dilengkapi file `vercel.json` sehingga Vercel akan otomatis mengenali framework **Vite** dan mengatur routing SPA secara otomatis.

---

## Langkah 2: Hubungkan & Deploy di Vercel

1. Buka [Vercel Dashboard](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** > **"Project"**.
3. Pilih repository GitHub **SIM Sarpras SMP** yang sudah Anda buat, lalu klik **"Import"**.
4. Pada bagian konfigurasi proyek:
   - **Framework Preset**: `Vite` (terdeteksi otomatis)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (atau `vite build`)
   - **Output Directory**: `dist`
5. Klik **"Deploy"**. Tunggu proses build selesai sekitar 1-2 menit.
6. Anda akan mendapatkan URL publik aplikasi, contohnya:
   ```
   https://sim-sarpras-smp.vercel.app
   ```

---

## Langkah 3: Daftarkan Domain Vercel ke Google/Firebase Console (Wajib Sekali)

Agar otentikasi Google Drive popup dapat dibuka dari domain Vercel Anda, domain Vercel harus didaftarkan di **Authorized Domains**:

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih project: `gen-lang-client-0062540886` (atau project Firebase sekolah Anda).
3. Di bilah menu kiri, klik **Build** > **Authentication**.
4. Klik tab **Settings** (Pengaturan) di bagian atas.
5. Klik submenu **Authorized domains** (Domain yang diizinkan).
6. Klik **Add domain** (Tambah domain).
7. Masukkan domain Vercel Anda tanpa `https://`, contoh:
   ```
   sim-sarpras-smp.vercel.app
   ```
8. Klik **Save / Simpan**.

*Catatan: Jika Anda menghubungkan domain sekolah kustom (misal: `sarpras.smp3kras.sch.id`), daftarkan juga domain tersebut di menu yang sama.*

---

## Langkah 4: Cara Kerja Database Terpusat di Google Drive

1. **Masuk Sebagai Admin**:
   - Di link Vercel Anda, buka halaman Login Admin (`/#/login`).
   - Masukkan Username: `admin` dan Password: `admin123`.
2. **Hubungkan Master Database Google Drive**:
   - Klik tombol **"Hubungkan Drive"** di header atas atau buka menu **Pengaturan > Backup & Cloud**.
   - Masuk menggunakan akun Google sekolah (misal: akun admin `@smp.belajar.id` atau Gmail resmi sekolah).
3. **Penyimpanan Terpusat Otomatis**:
   - Sistem akan otomatis membuat folder:
     `Google Drive > SIM Sarpras SMP - Database & Arsip`
   - File database master:
     `sim_sarpras_db.json`
   - **Sinkronisasi Otomatis (Auto-Sync)**: Setiap kali ada barang baru ditambahkan, ruangan diperbarui, atau peminjaman disetujui di Vercel, data akan otomatis diunggah ke file `sim_sarpras_db.json` di Google Drive dalam hitungan detik.
   - **Akses Multi-Perangkat**: Jika operator lain membuka link Vercel dari komputer atau HP lain dan menghubungkan Google Drive yang sama, aplikasi akan langsung memuat database master yang sama persis!
   - **Snapshot Cadangan**: Anda juga dapat membuat snapshot arsip permanen bertanggal kapan saja dari menu Google Drive.
