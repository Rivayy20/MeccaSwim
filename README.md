# Mecca Swim — Sistem Presensi & Monitoring Les Renang Digital

Sistem Presensi **Mecca Swim** adalah aplikasi web modern berbasis Next.js App Router yang dirancang khusus untuk mempermudah pelatih les renang dalam mengelola data murid, mengatur jadwal kelas, melakukan presensi digital secara real-time via QR Code, melacak kemajuan teknik renang murid, serta menyajikan portal monitoring khusus bagi orang tua murid tanpa harus melakukan login.

---

## 🌟 Fitur Utama

### 1. Dashboard Khusus Pelatih (Guru)
* **Statistik Real-time**: Memantau kehadiran bulanan rata-rata, jumlah total murid, total kelas, serta daftar sesi presensi aktif hari ini secara langsung.
* **Manajemen Data Murid (CRUD)**: Mendaftarkan murid baru, mengelola profil, dan mengelompokkan murid berdasarkan kelas latihan. Setiap murid otomatis mendapatkan token unik yang aman untuk tautan portal orang tua.
* **Manajemen Data Kelas (CRUD)**: Mengelola nama kelas, jadwal latihan, kapasitas maksimal, dan 4 pilihan lokasi kolam latihan:
  * Kolam Fatima Utama
  * Tirta Sambara
  * Tirta Rahayu
  * Semilir
* **Sistem Presensi Digital & QR Code**:
  * Menghasilkan token QR Code unik dengan opsi masa berlaku dinamis (15 menit, 30 menit, 60 menit, atau tanpa batas waktu selama sesi aktif).
  * Dilengkapi countdown timer dan progress bar visual yang interaktif.
  * Presensi manual: Pelatih dapat mengubah status kehadiran murid kapan saja jika diperlukan.
* **Pemberitahuan WhatsApp Otomatis (Fonnte)**: Mengirimkan pesan notifikasi secara otomatis ke nomor WhatsApp orang tua ketika murid berhasil dipindai atau dikonfirmasi kehadirannya.
* **Manajemen Pembayaran SPP**:
  * Pencatatan tagihan multi-periode (Harian dengan kalender tanggal, Mingguan ke-1 s.d ke-5, dan Bulanan).
  * Status lunas / belum lunas, pencatatan nominal tagihan, metode bayar (tunai/transfer), dan catatan tambahan.
  * Visualisasi total tagihan, total terbayar, dan sisa piutang.
* **Rekapitulasi Bulanan & Ekspor Excel (.xlsx)**:
  * Mengumpulkan data riwayat absensi bulanan.
  * Ekspor file Excel berformat rapi (.xlsx) menggunakan `exceljs`, lengkap dengan metadata, zebra-striping, auto-fit lebar kolom, dan penanda warna otomatis untuk status kehadiran (Hadir, Izin, Sakit, Alpha, dan Persentase).
  * Ekspor laporan keuangan SPP berformat Excel yang rapi dengan ringkasan status lunas (hijau) dan belum lunas (merah).
* **Progress Tracker (Level Kemajuan)**:
  * Melacak tingkat level murid (Pemula, Menengah, Mahir).
  * Mencentang keterampilan renang standar (Water Trappen, Meluncur, Gaya Bebas, Gaya Dada, dll) serta menambahkan keterampilan teknik kustom secara fleksibel.
  * Menulis catatan khusus pelatih dan target latihan berikutnya.
* **Offline Mode (PWA)**:
  * Berfungsi penuh sebagai Progressive Web App yang dapat diinstal di HP/Desktop.
  * Mendukung pencatatan kehadiran secara offline ketika koneksi internet pelatih terputus. Data disimpan sementara di penyimpanan lokal (`localStorage`) dan akan disinkronkan otomatis ke database Supabase saat koneksi internet pulih.

### 2. Portal Orang Tua (Tanpa Login)
* **Akses Tautan Unik**: Mengakses riwayat kehadiran anak secara instan tanpa perlu mendaftar akun atau mengingat kata sandi. Tautan dilindungi token acak yang aman (UUID/Secure Token).
* **Progress & Lencana Keterampilan**: Orang tua dapat memantau keterampilan renang apa saja yang sudah dikuasai anak, target latihan berikutnya, tingkat level kemampuan, serta catatan evaluasi dari pelatih.
* **Sistem Izin Digital**: Orang tua dapat langsung mengirim pengajuan izin latihan (Izin/Sakit) secara online yang akan masuk langsung ke dashboard pelatih.
* **Riwayat & Grafik Kehadiran**: Menampilkan statistik persentase kehadiran bulanan beserta status lengkap kehadiran per hari latihan.

---

## 🛠️ Tech Stack & Library

* **Framework**: Next.js 14 (App Router)
* **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, GoTrue)
* **CSS Styling**: Vanilla CSS (TailwindCSS 3 & Tailwind-Merge)
* **Real-time Channel**: Supabase Realtime Subscription (WebSocket)
* **Icons**: Lucide React
* **Excel Processing**: ExcelJS
* **WhatsApp Integration**: Fonnte API Gateway
* **Offline & PWA**: Service Workers & Web Manifest

---

## 🔑 Variabel Lingkungan (.env)

Buat file `.env.local` di folder root proyek Anda dan masukkan konfigurasi berikut:

```env
# Koneksi Database & Auth Supabase (Dapatkan di Dashboard Supabase -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# URL Utama Aplikasi (Gunakan localhost saat dev, atau domain Vercel Anda di production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Token API Fonnte untuk Pengiriman Notifikasi WhatsApp (Fonnte.com)
FONNTE_TOKEN=your_fonnte_api_token
```

---

## 📂 Struktur Database Supabase

Pastikan skema database PostgreSQL Anda memiliki tabel-tabel berikut:
1. `classes`: Menyimpan data kelas (nama, hari, jadwal, lokasi, kapasitas, dll).
2. `students`: Menyimpan data murid (nama, jenis kelamin, usia, ortu_nama, ortu_hp, kelas_id, link_token, dll).
3. `sessions`: Menyimpan sesi latihan aktif yang dibuka guru (kelas_id, status, created_at, expires_at, qr_token, dll).
4. `attendance`: Riwayat absensi per sesi per murid (session_id, student_id, status: HADIR/IZIN/SAKIT/ALPHA, marked_at, dll).
5. `permits`: Pengajuan izin digital dari portal orang tua (student_id, date, status: IZIN/SAKIT, keterangan, dll).
6. `spp_payments`: Pencatatan tagihan & pembayaran SPP murid (student_id, tipe: Bulanan/Mingguan/Harian, periode_detail, nominal, status: Lunas/Belum Bayar, dll).
7. `skills_tracker`: Menyimpan pencapaian teknik renang murid (student_id, level, skills_list, custom_skills, coach_notes, next_target, dll).

---

## 🚀 Panduan Deploy ke Vercel

Sistem presensi ini telah diuji dan divalidasi 100% lulus Next.js production build secara optimal.

### Langkah 1: Push Proyek ke GitHub Anda
1. Inisialisasi git di folder lokal Anda (jika belum):
   ```bash
   git init
   ```
2. Tambahkan semua file proyek:
   ```bash
   git add .
   ```
3. Commit perubahan pertama Anda:
   ```bash
   git commit -m "Initial commit - Mecca Swim Ready for Vercel"
   ```
4. Tambahkan link remote ke repository GitHub Anda (gunakan tautan https Anda):
   ```bash
   git remote add origin https://github.com/Rivayy20/MeccaSwim.git
   ```
5. Push kode program ke repositori:
   ```bash
   git branch -M main
   git push -u origin main
   ```
   > [!IMPORTANT]
   > File `.env.local` secara otomatis diabaikan oleh `.gitignore` dan **TIDAK AKAN** terunggah ke repositori GitHub publik Anda demi menjaga kerahasiaan kredensial database & kunci API Fonnte Anda.

### Langkah 2: Deploy ke Vercel
1. Masuk ke akun [Vercel](https://vercel.com/) Anda menggunakan akun GitHub.
2. Klik tombol **Add New** lalu pilih **Project**.
3. Cari repository `Rivayy20/MeccaSwim` dan klik **Import**.
4. Di bagian **Environment Variables**, masukkan seluruh variabel lingkungan berikut dengan nilai aslinya:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_APP_URL` (Ubah nilainya menjadi domain produksi Vercel Anda, misal: `https://meccaswim.vercel.app`)
   * `FONNTE_TOKEN` (Jika ingin mengaktifkan notifikasi WA)
5. Klik tombol **Deploy** dan tunggu proses kompilasi selesai.

---

## ⚙️ Pengaturan Penting di Supabase & Vercel (Registrasi & Verifikasi Email)

Agar registrasi akun pelatih baru dan pengiriman email konfirmasi berjalan lancar, Anda wajib menyesuaikan pengaturan berikut:

### 1. URL Pengalihan (Redirect URLs) di Supabase Auth
Setelah pelatih baru mendaftar akun dan mengeklik tautan konfirmasi di emailnya, Supabase akan mengarahkan pengguna kembali ke aplikasi Anda. Konfigurasikan ini agar mengarah ke domain Vercel Anda:
* Masuk ke **Supabase Dashboard** -> Proyek Anda.
* Buka menu **Authentication** -> **URL Configuration**.
* Di bagian **Site URL**, masukkan URL produksi Vercel Anda:
  `https://meccaswim.vercel.app` (sesuaikan dengan domain Anda).
* Di bagian **Redirect URLs**, tambahkan URL pengalihan callback:
  `https://meccaswim.vercel.app/auth/callback` (atau tambahkan pattern wildcard: `https://meccaswim.vercel.app/**`).
* Klik **Save**.

### 2. Aktivasi Konfirmasi Email (Confirm Email)
Untuk memastikan pengguna harus memverifikasi emailnya sebelum bisa login:
* Buka **Authentication** -> **Providers** -> **Email**.
* Pastikan toggle **Confirm email** berada dalam posisi **ON (Enabled)**.
* Simpan konfigurasi jika ada perubahan.

### 3. SMTP Kustom (Direkomendasikan untuk Production)
Supabase menyediakan SMTP bawaan dengan limitasi pengiriman email harian yang ketat (3 email per jam). Untuk penggunaan produksi yang andal, disarankan menggunakan SMTP eksternal kustom (misal: Resend, Brevo, SendGrid, Mailgun, atau akun Gmail SMTP):
* Buka **Authentication** -> **SMTP Settings**.
* Nyalakan toggle **Enable Custom SMTP**.
* Lengkapi data **SMTP Host**, **Port**, **Sender Email**, **Username**, dan **Password** dari penyedia SMTP pilihan Anda.
* Klik **Save**.

---

## 📱 Offline Mode & PWA Support
Aplikasi ini sudah dilengkapi Service Worker untuk caching aset statis dan offline access. Guru les dapat menginstal aplikasi ke layar utama perangkat (Add to Home Screen) melalui Google Chrome di Android atau Safari di iOS untuk mendapatkan pengalaman layaknya aplikasi native. Saat berada di kolam dengan sinyal buruk, guru tetap dapat melakukan presensi kehadiran secara lancar.

---

## 📄 Lisensi
Proyek ini dilindungi di bawah hak cipta internal Mecca Swim. Penggunaan komersial tanpa seizin pemilik kode program dilarang keras.
