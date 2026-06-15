import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">Kebijakan Privasi</h1>
          <p className="text-muted-foreground">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              Privasi dan keamanan data Anda, serta data murid Anda, adalah prioritas utama kami di Mecca Swim. Kami berkomitmen untuk melindungi informasi pribadi yang Anda percayakan kepada kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Untuk menyediakan layanan pengelolaan presensi yang optimal, kami dapat mengumpulkan tipe informasi berikut:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Data Akun:</strong> Nama pengelola, nama akademi/klub, alamat email, dan nomor telepon.</li>
              <li><strong>Data Murid:</strong> Nama murid, nomor WhatsApp orang tua (untuk keperluan notifikasi bot otomatis), dan log histori kehadiran.</li>
              <li><strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda menavigasi dan menggunakan *dashboard* kami, untuk meningkatkan *user experience* (UX).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Data yang dikumpulkan secara eksklusif digunakan untuk keperluan layanan platform, antara lain:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
              <li>Membangkitkan (Generate) QR Code unik untuk masing-masing murid.</li>
              <li>Mengirimkan otomatisasi notifikasi WhatsApp ke nomor orang tua yang terdaftar.</li>
              <li>Menyusun laporan rekapitulasi format Excel yang bisa Anda unduh.</li>
              <li>Menyediakan *customer support* (termasuk *chatbot* AI) yang lebih kontekstual.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Keamanan dan Perlindungan Data</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Kami tidak akan **pernah menjual, menyewakan, atau mendistribusikan** data pribadi akademi, pelatih, maupun murid Anda kepada pihak ketiga untuk tujuan pemasaran (*marketing*). Semua data dilindungi menggunakan standar enkripsi dan *database* yang aman.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Penggunaan Cookies</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Kami mungkin menggunakan *cookies* untuk menyimpan sesi masuk (login) Anda dan preferensi tema (Mode Gelap/Terang), sehingga Anda tidak perlu terus-menerus mengatur ulang preferensi saat menggunakan platform secara berkala.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Hak Anda atas Data</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Sebagai pemilik akademi, Anda memegang kendali penuh atas data murid. Kapanpun Anda memutuskan untuk berhenti berlangganan, Anda dapat meminta agar seluruh data akun dan data presensi dihapus permanen dari peladen (*server*) kami.
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
