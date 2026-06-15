import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">Syarat dan Ketentuan</h1>
          <p className="text-muted-foreground">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Pendahuluan</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Selamat datang di Mecca Swim. Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda terhadap platform perangkat lunak manajemen presensi renang yang kami sediakan. Dengan mengakses atau menggunakan platform kami, Anda setuju untuk terikat oleh Ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Layanan Platform</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Mecca Swim adalah layanan perangkat lunak berbasis langganan (SaaS) yang memungkinkan instruktur renang dan manajemen akademi untuk:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Mencatat kehadiran murid menggunakan pemindaian QR Code.</li>
              <li>Mengirimkan notifikasi WhatsApp otomatis kepada orang tua.</li>
              <li>Mengelola jadwal sesi kelas renang.</li>
              <li>Mengekspor laporan data kehadiran dalam format Excel.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Akun Pengguna</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Untuk menggunakan layanan tertentu, Anda wajib mendaftar dengan memberikan informasi yang akurat, lengkap, dan terkini. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda dan membatasi akses ke akun Anda.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Kami berhak untuk menangguhkan atau menghentikan akun yang terbukti melanggar kebijakan keamanan atau memberikan data yang palsu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Penggunaan yang Sah</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Anda setuju untuk menggunakan layanan Mecca Swim hanya untuk tujuan yang sah secara hukum dan sesuai dengan Ketentuan ini. Dilarang keras menggunakan sistem ini untuk mengirim *spam* atau pesan massal yang tidak terkait dengan informasi kelas renang.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Pembayaran dan Langganan</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Biaya langganan dibayarkan secara berkala (bulanan atau tahunan) di muka. Kami tidak memberikan pengembalian dana (*refund*) untuk biaya langganan yang sudah dibayarkan, kecuali terjadi kendala teknis fatal dari pihak kami yang tidak dapat diselesaikan dalam 14 hari kerja.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Perubahan Ketentuan</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Kami dapat merevisi Syarat dan Ketentuan ini dari waktu ke waktu. Versi terbaru akan selalu tersedia di halaman ini. Dengan terus mengakses dan menggunakan platform setelah perubahan berlaku, Anda setuju untuk terikat dengan ketentuan yang direvisi.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mecca Swim. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
