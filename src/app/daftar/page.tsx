'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { APP_NAME } from '@/lib/constants';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function GeneralRegistrationClosedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 water-pattern flex items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-[10%] left-[15%] w-[35vw] h-[35vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />

      <div className="w-full max-w-md z-10 animate-scale-in my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="h-14 w-14 relative flex items-center justify-center rounded-2xl overflow-hidden shadow-md border-2 border-white/50 dark:border-slate-800/50 bg-white dark:bg-slate-900">
              <Image src="/icons/logo.png" alt="Mecca Swim Logo" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300">
                {APP_NAME}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">Portal Presensi</span>
            </div>
          </Link>
        </div>

        <Card variant="glass" className="border-slate-200/50 dark:border-white/10 shadow-glass-lg backdrop-blur-xl bg-white/90 dark:bg-slate-900/80 p-2 md:p-4 text-center">
          <CardHeader className="pb-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-3 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <Lock className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Pendaftaran Publik Tertutup
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Pendaftaran murid baru tidak dapat dilakukan melalui tautan umum ini.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-6">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-left space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                Informasi Pendaftaran:
              </p>
              <p className="leading-relaxed">
                Setiap instruktur / pelatih renang di Mecca Swim memiliki <strong className="text-foreground">tautan pendaftaran khusus</strong> masing-masing.
              </p>
              <p className="leading-relaxed">
                Silakan hubungi instruktur atau pelatih Anda untuk meminta link pendaftaran resmi agar data langsung masuk ke kelas yang tepat.
              </p>
            </div>

            <Link href="/" className="block">
              <Button className="w-full h-12 text-base font-bold shadow-glow-cyan">
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
