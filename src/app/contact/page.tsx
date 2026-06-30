'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Send } from 'lucide-react';

function ContactForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const isAcademy = plan === 'academy';

  const title = isAcademy ? 'Konsultasi Paket Academy' : 'Hubungi Kami';
  const desc = isAcademy 
    ? 'Tertarik dengan Paket Academy? Tinggalkan kontak Anda dan Tim Sales khusus kami akan segera menghubungi Anda untuk diskusi lebih lanjut.'
    : 'Punya pertanyaan seputar layanan kami? Tinggalkan pesan di bawah ini.';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          subject: isAcademy ? 'Pengajuan Konsultasi Paket Academy' : 'Pesan Baru dari Halaman Kontak Mecca Swim',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Terjadi kesalahan saat mengirim pesan.');
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Pesan Terkirim!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Terima kasih telah menghubungi kami. Tim kami akan membaca pesan Anda dan segera memberikan balasan melalui email atau nomor kontak yang Anda cantumkan.
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{title}</h1>
            <p className="text-slate-600 dark:text-slate-400">{desc}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="Tipe Pengajuan" value={isAcademy ? 'Konsultasi Paket Academy' : 'Pertanyaan Umum (Kontak)'} />
            
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Anda</label>
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
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{isAcademy ? 'Pesan / Skala Bisnis Anda' : 'Pesan'}</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder={isAcademy ? "Cth: Saya memiliki 5 cabang klub renang dengan total 500 murid, mohon info lebih lanjut..." : "Tulis pertanyaan atau kendala Anda di sini..."}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-4 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  Kirim Pesan
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ContactForm />
    </Suspense>
  );
}
