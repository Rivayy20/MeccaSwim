'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Send } from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const isGrowth = plan === 'growth';
  const planTitle = isGrowth ? 'Paket Growth' : 'Paket Starter (Gratis)';
  const formTitle = isGrowth ? 'Pendaftaran Paket Growth' : 'Mulai Gratis';
  const formDesc = isGrowth 
    ? 'Langkah hebat! Silakan isi data Anda untuk mulai menggunakan fitur lengkap kelas premium.' 
    : 'Isi data klub renang Anda untuk mendapatkan akses uji coba gratis.';
  const btnText = isGrowth ? 'Minta Akses Growth' : 'Kirim Pengajuan Gratis';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '');
    formData.append('subject', `Pengajuan Akun Baru Mecca Swim - ${planTitle}`);
    formData.append('from_name', 'Sistem Pendaftaran Mecca Swim');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Terjadi kesalahan saat mengirim data.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Gagal terhubung ke server. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A1C3A] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 text-center border border-border/50"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Pengajuan Berhasil!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Terima kasih telah mendaftar untuk <strong>{planTitle}</strong>. Tim sales kami telah menerima data Anda dan akan segera menghubungi Anda melalui WhatsApp atau Email untuk proses pengaturan akun.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06152F] flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto z-10">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A1C3A]/90 backdrop-blur-xl border border-border/50 dark:border-white/10 rounded-3xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{formTitle}</h1>
            <p className="text-slate-600 dark:text-slate-400">{formDesc}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="Pilihan Paket" value={planTitle} />
            
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Cth: Budi Santoso"
              />
            </div>

            <div>
              <label htmlFor="club_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Klub Renang</label>
              <input
                type="text"
                id="club_name"
                name="club_name"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Cth: Mecca Swim Academy"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Aktif</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Cth: budi@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Cth: 08123456789"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-12 mt-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center ${isGrowth ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-r from-primary to-blue-500 shadow-primary/30'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  {btnText}
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              Dengan mengirim form ini, Anda menyetujui <Link href="/terms" className="text-primary hover:underline">Syarat & Ketentuan</Link> serta <Link href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link> kami.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
