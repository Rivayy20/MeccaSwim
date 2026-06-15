# Mecca Swim — Sistem Presensi & Monitoring Les Renang Digital

Sistem Presensi **Mecca Swim** adalah aplikasi web modern berbasis Next.js App Router yang dirancang khusus untuk mempermudah pelatih les renang dalam mengelola data murid, mengatur jadwal kelas, melakukan presensi digital secara real-time via QR Code, melacak kemajuan teknik renang murid, serta menyajikan portal monitoring khusus bagi orang tua murid tanpa harus melakukan login.

Pada iterasi terbarunya, Mecca Swim kini dilengkapi dengan *Landing Page* berkelas profesional, sistem formulir dinamis yang terintegrasi dengan Web3Forms, serta Asisten Cerdas AI (MeccaBot).

---

## 🌟 Fitur Utama Terbaru

### 1. Landing Page Profesional & Modern
* **Premium UI/UX**: Desain antarmuka berstandar *Enterprise* dengan efek animasi *framer-motion*, *glassmorphism*, dan transisi visual mulus (mendukung Light & Dark Mode).
* **Trust Cards & Pricing**: Bagian harga yang dirancang atraktif dan dinamis, terintegrasi langsung dengan rute khusus untuk registrasi sesuai jenis layanan (*Starter, Growth, Academy*).
* **FAQ Dinamis (Smart Search)**: Sistem tanya-jawab interaktif berbasis *Accordion* dengan fitur penelusuran (pencarian langsung) tanpa hambatan (*client-side filtering*).

### 2. MeccaBot (Asisten Virtual AI)
* **Integrasi Google Gemini 2.0 Flash**: Chatbot interaktif langsung di *Landing Page* untuk membantu menjawab pertanyaan calon klien dengan pendekatan yang hangat dan solutif.
* **Real-time Interface**: Memberikan indikator ketika *AI* sedang mengetik dan mampu menangani pemulihan dari kesalahan jaringan secara pintar.

### 3. Formulir Pendaftaran Dinamis (Web3Forms)
* Pengalihan jalur dari tombol pemesanan langsung ke formulir *Register* dan *Contact* dengan pengisian pra-kondisi URL (`?plan=academy`).
* Memanfaatkan **Web3Forms** tanpa memerlukan *backend mailer* tradisional, di mana setiap submission pendaftaran dikirim secara langsung ke email Anda secara *real-time*.

### 4. Dashboard Khusus Pelatih (Guru)
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
  * Pencatatan tagihan multi-periode (Harian, Mingguan, Bulanan).
  * Status lunas / belum lunas, pencatatan nominal tagihan, dan metode bayar (tunai/transfer).

### 5. Portal Orang Tua Tanpa Login (Public Token Based)
* **Rekap Kehadiran Interaktif**: Menampilkan data statistik kehadiran secara bulanan dengan kalender yang dapat difilter.
* **Status Progres Latihan**: Menampilkan tingkat kemampuan murid (Pemula, Menengah, Mahir), teknik yang telah dikuasai, fokus target latihan, serta catatan khusus dari pelatih secara transparan.
* **Sistem Izin Latihan Dinamis**: Orang tua dapat dengan mudah mengajukan status izin atau sakit pada hari jadwal latihan langsung melalui portal, yang otomatis akan menyinkronkannya sebagai data ketidakhadiran di sistem guru saat kelas dibuka.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** Next.js 14 (App Router) dengan React 18
* **Styling:** Tailwind CSS, Framer Motion, *next-themes* (Light/Dark Mode)
* **Komponen UI:** shadcn/ui, Radix UI, Lucide Icons
* **Database & Auth:** Supabase PostgreSQL, Supabase Auth
* **Forms & Emails:** Web3Forms API
* **AI Engine:** Google Generative AI (Gemini 2.0 Flash)
* **State Management:** React Context API, React Hooks (SWR/Custom)
* **QR Code System:** `qrcode.react`, `html5-qrcode`

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### Prasyarat
* **Node.js** (Versi >= 18 direkomendasikan)
* Akun **Supabase** (Buka [Supabase](https://supabase.com))
* Akun **Google AI Studio** (Buka [Google AI Studio](https://aistudio.google.com/))
* Kunci **Web3Forms** (Buka [Web3Forms](https://web3forms.com/))

### Langkah Instalasi

1. **Clone repository ini**
   ```bash
   git clone https://github.com/USERNAME_ANDA/MeccaSwim.git
   cd MeccaSwim
   ```

2. **Install semua dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file baru di root project dengan nama `.env.local` lalu isi dengan kredensial berikut:
   ```env
   # SUPABASE
   NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

   # WEB3FORMS (Untuk Formulir Pendaftaran)
   NEXT_PUBLIC_WEB3FORMS_KEY="YOUR_WEB3FORMS_ACCESS_KEY"

   # GEMINI AI (Untuk MeccaBot)
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

   # API URL UTAMA (Opsional untuk lingkungan dev lokal)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Jalankan Aplikasi Mode Development**
   ```bash
   npm run dev
   ```
   Akses `http://localhost:3000` di browser Anda untuk melihat aplikasi yang sedang berjalan.

---

## 🔒 Security Best Practices
- Pastikan bahwa `GEMINI_API_KEY` diletakkan di API Routes (`/api/chat/route.ts`) agar kuncinya terlindungi di sisi *server-side* dan **tidak bocor** ke browser pengunjung.
- Hindari menyalin nilai `NEXT_PUBLIC_` yang bersifat konfidensial di luar lingkungan produksi yang resmi dikelola (seperti Vercel).
- Aplikasi ini sudah di-*setup* dengan mekanisme `try-catch` aman untuk mencegah tindakan manipulasi pada fungsionalitas login (anti-*user enumeration*).

---

> Dibuat dengan antusiasme untuk mendukung dan mempercepat adaptasi manajemen pembelajaran olahraga berkelas. Hubungi tim Mecca Swim untuk keterangan lebih lanjut atau pelajari lebih dalam di halaman /demo.
