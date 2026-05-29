import React from 'react';
import Link from 'next/link';
import { Waves, QrCode, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

export const metadata = {
  title: `${APP_NAME} - Sistem Presensi Les Renang`,
  description: APP_DESCRIPTION,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero water-pattern relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Floating Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-200/20 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-teal-200/20 blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Navigation header */}
      <header className="w-full max-w-7xl mx-auto h-20 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 select-none">
          <span className="text-3xl" role="img" aria-label="wave">
            🏊
          </span>
          <span className="font-extrabold text-xl tracking-wider text-gradient">
            {APP_NAME}
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center font-bold text-sm h-10 px-5 rounded-lg border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:scale-[0.98] transition-all"
        >
          Masuk Guru
        </Link>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <div className="flex-1 space-y-6 text-left max-w-xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/50 border border-primary-200 text-primary-700 text-xs font-semibold select-none">
            <Waves className="h-3.5 w-3.5 text-primary-500 animate-pulse" />
            <span>Presensi Digital Les Renang</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Pencatatan Presensi Renang Jadi Lebih{' '}
            <span className="text-gradient">Mudah & Otomatis</span>
          </h2>
          <p className="text-base text-slate-600 font-medium">
            Gantikan pencatatan manual di kertas dengan sistem presensi QR Code real-time. 
            Orang tua dapat memantau kehadiran anak langsung melalui WhatsApp dan portal khusus.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-bold text-sm h-12 px-6 rounded-xl gradient-primary text-white shadow-lg hover:shadow-xl hover:brightness-105 active:scale-[0.98] transition-all group"
            >
              <span>Mulai Sesi Sekarang</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl animate-fade-in">
          <div className="p-6 bg-card border border-border shadow-card rounded-2xl flex flex-col justify-between hover-lift">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl w-fit">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">QR Code Real-time</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Guru tinggal buka QR code di layar HP/tablet, orang tua scan untuk konfirmasi kehadiran anak secara instan.
              </p>
            </div>
          </div>

          <div className="p-6 bg-card border border-border shadow-card rounded-2xl flex flex-col justify-between hover-lift">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit">
              <Shield className="h-6 w-6" />
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Portal Khusus Ortu</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Setiap murid mendapatkan link unik. Orang tua dapat melihat riwayat kehadiran & persentase latihan bulanan.
              </p>
            </div>
          </div>

          <div className="p-6 bg-card border border-border shadow-card rounded-2xl flex flex-col justify-between hover-lift md:col-span-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Notifikasi WhatsApp Instan</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Begitu murid masuk / hadir, sistem akan langsung mengirim pesan WhatsApp ke nomor HP orang tua sebagai laporan.
                </p>
              </div>
              <div className="px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg select-none">
                WhatsApp Ready ✅
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 py-6 text-center z-10 bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-slate-400 font-semibold">
          © {new Date().getFullYear()} {APP_NAME}. Dibuat dengan 💙 untuk Guru Renang Indonesia.
        </p>
      </footer>
    </div>
  );
}
