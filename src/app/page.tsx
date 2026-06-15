'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Waves, QrCode, Shield, CheckCircle2, ArrowRight, Play,
  FileSpreadsheet, Users, Smartphone, BarChart3, Clock,
  MessageCircle, Star, Lock, ChevronDown, Menu, X, Zap,
  CreditCard, HelpCircle, ChevronLeft, ChevronRight, ChevronUp, Search,
  ShieldCheck, TrendingUp, XCircle
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import ChatWidget from '@/components/ChatWidget';

// Custom Hooks
const useWindowScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
};

// Data for Features Modal
const FEATURES_DATA = [
  {
    id: 'dashboard',
    title: 'Dashboard Guru',
    icon: BarChart3,
    desc: 'Kelola seluruh aktivitas kelas renang dari satu dashboard modern dan intuitif.',
    benefits: [
      'Statistik Kehadiran Real-time',
      'Ringkasan Aktivitas Harian',
      'Monitoring Performa Murid',
      'Kontrol Kelas Terpusat'
    ],
    image: '/images/mockups/dashboard.png' // User please add this image
  },
  {
    id: 'manajemen',
    title: 'Manajemen Kelas',
    icon: Users,
    desc: 'Atur jadwal, tambah murid, dan kelola sesi latihan dengan sangat mudah tanpa batasan.',
    benefits: [
      'Pembuatan Sesi Fleksibel',
      'Grup Kelas Kustom',
      'Sinkronisasi Jadwal',
      'Manajemen Profil Murid'
    ],
    image: '/images/mockups/manajemen-kelas.png', // User please add this image
    images: [
      '/images/mockups/manajemen-kelas-1.png',
      '/images/mockups/manajemen-kelas-2.png',
      '/images/mockups/manajemen-kelas-3.png',
      '/images/mockups/manajemen-kelas-4.png'
    ]
  },
  {
    id: 'histori',
    title: 'Histori Presensi',
    icon: Clock,
    desc: 'Akses riwayat kehadiran setiap murid dengan detail waktu kedatangan presisi.',
    benefits: [
      'Log Waktu Kehadiran',
      'Rekapitulasi Bulanan',
      'Pencarian Data Historis',
      'Tanda Kehadiran Manual/QR'
    ],
    image: '/images/mockups/histori-presensi.png' // User please add this image
  },
  {
    id: 'portal',
    title: 'Portal Orang Tua',
    icon: Lock,
    desc: 'Beri orang tua transparansi penuh dengan akses khusus untuk memantau kehadiran anak mereka.',
    benefits: [
      'Akses Link Aman',
      'Grafik Kehadiran Anak',
      'Histori Latihan Spesifik',
      'Mobile-Friendly View'
    ],
    image: '/images/mockups/portal-ortu.png' // User please add this image
  },
  {
    id: 'sesi-presensi-qr',
    title: 'Sesi Presensi QR',
    icon: QrCode,
    desc: 'Catat kehadiran murid dengan cepat dan akurat menggunakan pemindaian QR Code dari smartphone.',
    benefits: [
      'Pemindaian Sekejap Mata',
      'Kode QR Dinamis Tiap Sesi',
      'Akurasi Data Kehadiran',
      'Terhindar dari Antrean Panjang'
    ],
    image: '/images/mockups/sesi-presensi-qr.png', // User please add this image
    images: [
      '/images/mockups/sesi-presensi-qr-1.png',
      '/images/mockups/sesi-presensi-qr-2.png',
      '/images/mockups/sesi-presensi-qr-3.png'
    ]
  },
  {
    id: 'export',
    title: 'Export Laporan',
    icon: FileSpreadsheet,
    desc: 'Unduh seluruh data kehadiran menjadi file Excel yang rapi dan siap dilaporkan.',
    benefits: [
      'Export Format XLSX',
      'Filter Rentang Waktu',
      'Data Tersusun Rapi',
      'Siap untuk Administrasi Keuangan'
    ],
    image: '/images/mockups/export-laporan.png', // User please add this image
    images: [
      '/images/mockups/export-laporan-1.png',
      '/images/mockups/export-laporan-2.png'
    ]
  }
];

export default function LandingPage() {
  const scrollY = useWindowScroll();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Animations
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  useEffect(() => {
    if (activeFeature !== null || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setActiveImageIndex(0);
  }, [activeFeature, isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-300 overflow-x-hidden">

      {/* Animated Background Gradients & Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft atmospheric gradients instead of borders */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 dark:bg-primary/5 blur-[120px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[30%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />

        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03] dark:opacity-[0.04]" />
        {/* Subtle grid for tech feel */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.015] bg-[length:40px_40px] mask-image-linear-gradient-to-b" />
      </div>

      {/* Premium Sticky Navbar (Borderless) */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${activeFeature !== null ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''
          } ${scrollY > 20
            ? 'py-3 bg-background/80 dark:bg-[#06152F]/60 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.05)]'
            : 'py-6 bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden glass-card shadow-sm group-hover:shadow-[0_0_20px_rgba(33,212,253,0.3)] transition-all duration-300">
              <Image src="/icons/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['Fitur', 'Cara Kerja', 'Harga', 'FAQ'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:inset-x-0 after:bottom-[-4px] after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-bold text-sm h-10 px-6 rounded-full bg-foreground text-background shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all"
            >
              Masuk Guru
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2 text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background/95 backdrop-blur-2xl border-l border-border/20 dark:border-white/5 z-50 md:hidden flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden glass-card shadow-sm">
                    <Image src="/icons/logo.png" alt="Logo" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-lg leading-none text-foreground">{APP_NAME}</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Presensi Digital</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex flex-col p-4 gap-2 mt-2">
                {[
                  { label: 'Fitur', icon: Star, href: '#fitur' },
                  { label: 'Cara Kerja', icon: Zap, href: '#cara-kerja' },
                  { label: 'Harga', icon: CreditCard, href: '#harga' },
                  { label: 'FAQ', icon: HelpCircle, href: '#faq' },
                ].map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    key={item.label}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all group font-semibold text-lg"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <item.icon className="h-5 w-5 group-hover:text-primary transition-colors" />
                      </div>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Quick Benefit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mx-6 mt-6 p-5 rounded-2xl bg-gradient-to-br from-card to-muted border border-border/50 dark:border-white/5"
              >
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Keunggulan Utama</p>
                <div className="space-y-3">
                  {['QR Code Real-time', 'WhatsApp Otomatis', 'Portal Orang Tua'].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-auto p-6"
              >
                <p className="text-center text-sm text-muted-foreground font-medium mb-4">Siap beralih ke presensi modern?</p>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center font-bold h-14 w-full rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgba(33,212,253,0.39)] hover:scale-[1.02] active:scale-[0.98] transition-transform text-lg"
                >
                  Masuk Guru
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-32 lg:pt-40">

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary text-sm font-semibold mb-8 shadow-glow-cyan">
              <Waves className="h-4 w-4" />
              <span>Sistem Presensi Renang Modern</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mb-6 leading-[1.1]">
              Pencatatan Presensi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Jadi Otomatis
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              Tinggalkan kertas basah di pinggir kolam. Kelola murid, pantau kehadiran, dan kirim rekap WhatsApp instan dalam satu platform elegan.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center font-bold text-base h-14 px-8 rounded-full bg-foreground text-background shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:scale-105 transition-transform w-full sm:w-auto overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Mulai Gratis</span>
                <ArrowRight className="relative z-10 ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo/dashboard"
                className="inline-flex items-center justify-center font-bold text-base h-14 px-8 rounded-full border border-border bg-background/50 backdrop-blur-md hover:bg-muted dark:hover:bg-card/50 transition-all w-full sm:w-auto"
              >
                <Play className="h-4 w-4 mr-2 fill-current text-primary" />
                Lihat Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Large Floating Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="w-full max-w-6xl mx-auto relative perspective-1000 mt-12 md:mt-20"
          >
            {/* Ambient glow behind mockup */}
            <div className="absolute inset-x-10 -bottom-10 h-3/4 bg-gradient-to-t from-primary/20 to-transparent blur-[80px] z-0" />

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative aspect-[16/10] md:aspect-[21/9] rounded-2xl md:rounded-[2rem] glass-card overflow-hidden z-10 shadow-2xl shadow-black/5 dark:shadow-primary/20"
              style={{ transformStyle: "preserve-3d", rotateX: scrollY > 0 ? `${Math.min(scrollY / 100, 8)}deg` : '0deg', transition: 'rotateX 0.5s ease-out' }}
            >
              {/* Mockup Header bar */}
              <div className="absolute top-0 inset-x-0 h-12 border-b border-border/50 dark:border-white/5 bg-muted/80 dark:bg-black/10 flex items-center px-4 gap-2 backdrop-blur-md z-20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 top-12 overflow-hidden z-10 bg-background/50">
                <Image 
                  src="/images/mockups/hero-mockup.png" 
                  alt="App Dashboard Mockup" 
                  fill 
                  className="object-cover object-top" 
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Seamless Soft Glow Separator instead of border */}
        <div className="w-full max-w-4xl mx-auto mt-12 md:mt-20 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />


        {/* Statistic Blocks with Deep Spacing */}
        <section className="py-12 md:py-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-primary/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Waktu Administrasi Dihemat', value: '90%', icon: Clock },
                { label: 'Presensi Tercatat Real-time', value: '100%', icon: Zap },
                { label: 'Notifikasi Ortu Terkirim', value: 'Instant', icon: MessageCircle },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeUp}
                  className="glass-card p-10 rounded-[2rem] flex flex-col items-center text-center group hover-lift bg-gradient-to-b from-card/40 to-transparent"
                >
                  <div className="p-4 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <stat.icon className="h-8 w-8 text-primary opacity-80 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-5xl font-black mb-2 text-foreground tracking-tight drop-shadow-sm">{stat.value}</h3>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-12 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center max-w-2xl mx-auto mb-8 md:mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-foreground">Apa Kata Pengguna Mecca Swim?</h2>
              <p className="text-muted-foreground text-lg">Platform presensi modern yang didesain khusus untuk kebutuhan pelatih dan akademi renang.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Presensi yang sebelumnya dicatat manual sekarang cukup beberapa detik. Orang tua juga langsung menerima laporan kehadiran.",
                  role: "Pelatih Renang",
                  initial: "P"
                },
                {
                  quote: "Rekap bulanan yang biasanya memakan waktu lama sekarang bisa langsung diekspor dan dibagikan.",
                  role: "Instruktur Renang",
                  initial: "I"
                },
                {
                  quote: "Fitur QR Code sangat membantu ketika jumlah murid sedang banyak. Mengurangi antrean secara signifikan.",
                  role: "Pemilik Kelas Renang",
                  initial: "M"
                }
              ].map((testi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="glass-card p-8 rounded-[2rem] flex flex-col h-full bg-gradient-to-br from-background/80 to-muted/30 border border-border/50 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-10px_rgba(33,212,253,0.1)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-6 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground text-lg leading-relaxed font-medium mb-8 flex-1">
                    &quot;{testi.quote}&quot;
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {testi.initial}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{testi.role}</p>
                      <p className="text-sm text-muted-foreground">Pengguna Mecca Swim</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Large Vertical Space Separator */}
        <div className="h-16 md:h-32" />

        {/* Zig-Zag Features Showcase */}
        <section id="fitur" className="py-12 md:py-24 overflow-hidden relative">
          <div className="absolute right-0 top-1/4 w-[40vw] h-[40vw] bg-teal-400/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute left-0 bottom-1/4 w-[40vw] h-[40vw] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 space-y-20 md:space-y-40 relative z-10">

            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-24">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_4px_20px_rgba(33,212,253,0.15)]">
                  <QrCode className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Scan Cepat,<br />Laporan Akurat.</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Guru cukup menunjukkan QR Code di smartphone. Murid memindai, dan sistem otomatis mencatat kehadiran beserta timestamp tanpa perlu kertas absen basah.
                  </p>
                </div>
                <ul className="space-y-4">
                  {['Generate QR dinamis tiap sesi', 'Mencegah kecurangan presensi', 'Sinkronisasi cloud real-time'].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-foreground font-medium">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 w-full aspect-square md:aspect-[4/3] glass-card rounded-[2.5rem] p-3 glow-cyan relative"
              >
                <div className="w-full h-full bg-gradient-to-br from-card to-background rounded-[2rem] flex items-center justify-center border border-border/30 dark:border-white/5 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <QrCode className="h-32 w-32 text-primary opacity-20 transform group-hover:scale-110 transition-transform duration-700" />
                </div>
              </motion.div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 lg:gap-24">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Notifikasi WhatsApp<br />Otomatis.</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Orang tua tidak perlu bertanya lagi. Begitu anak scan QR, sistem langsung mengirim pesan WhatsApp ke nomor orang tua memberitahu anak sudah hadir.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 w-full aspect-square md:aspect-[4/3] glass-card rounded-[2.5rem] p-3 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.1)] relative"
              >
                <div className="w-full h-full bg-gradient-to-br from-card to-background rounded-[2rem] flex flex-col items-center justify-center border border-border/30 dark:border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* WA Message bubbles with animation */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="bg-emerald-500 text-white p-5 rounded-2xl rounded-tr-none shadow-xl max-w-[80%] z-10"
                  >
                    <p className="text-sm font-medium leading-relaxed">
                      Halo Bunda, ananda Rafi telah hadir di sesi Latihan Renang sore ini. 🏊‍♂️
                    </p>
                    <p className="text-[10px] text-white/70 mt-2 text-right">15:30</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        <div className="h-16 md:h-32" />

        {/* How It Works (Timeline) - Seamless transition */}
        <section id="cara-kerja" className="py-12 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/50 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-32">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Alur Presensi Modern</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Dirancang untuk efisiensi maksimal di lingkungan kolam renang yang basah dan dinamis.</p>
            </div>

            <div className="relative">
              {/* Animated Connecting Path */}
              <div className="absolute top-12 left-0 right-0 h-[2px] bg-border/50 hidden lg:block rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: '-100%' }}
                  whileInView={{ x: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 relative z-10">
                {[
                  { step: '01', title: 'Buat Sesi', desc: 'Guru memilih kelas dan membuat sesi.', icon: Users },
                  { step: '02', title: 'Tampil QR', desc: 'Sistem generate QR Code unik.', icon: QrCode },
                  { step: '03', title: 'Murid Scan', desc: 'Murid hadir dan scan via HP mereka.', icon: Smartphone },
                  { step: '04', title: 'Auto Update', desc: 'Database terupdate & Ortu ternotifikasi.', icon: CheckCircle2 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: (i) => ({
                        opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" }
                      })
                    }}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="w-24 h-24 rounded-[2rem] glass-card flex items-center justify-center mb-8 relative group-hover:-translate-y-3 transition-all duration-500 group-hover:shadow-[0_20px_40px_-10px_rgba(33,212,253,0.2)] bg-card">
                      <item.icon className="h-10 w-10 text-primary transform group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-foreground text-background font-black flex items-center justify-center text-sm shadow-xl">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="font-bold text-2xl mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-2xl mx-auto my-16 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Interactive Screenshot Showcase Gallery - CLEAN LIGHT MODE */}
        <section id="demo" className="py-12 md:py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10 md:mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Tampilan Premium & Responsif</h2>
              <p className="text-xl text-muted-foreground">Klik card untuk melihat detail fitur dan antarmuka modern kami.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES_DATA.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                  onClick={() => setActiveFeature(i)}
                  className="group flex flex-col h-full rounded-[2.5rem] p-8 glass-card cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_20px_40px_-10px_rgba(33,212,253,0.1)] dark:hover:shadow-[0_20px_40px_-10px_rgba(33,212,253,0.2)] relative overflow-hidden"
                >
                  {/* Top Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 z-10">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="z-10 flex flex-col flex-1">
                    <h3 className="font-bold text-2xl mb-3 text-foreground tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex items-center text-primary font-bold text-sm">
                      Lihat Detail
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Subtle Background Decoration instead of black overlay */}
                  <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                    <item.icon className="h-48 w-48 text-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Modal (Framer Motion) */}
        <AnimatePresence>
          {activeFeature !== null && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-sm"
                onClick={() => setActiveFeature(null)}
              />

              {/* Modal Container */}
              <div className="fixed inset-0 z-[101] flex items-center justify-center p-0 md:p-8 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
                  className="relative w-full h-full md:h-auto md:max-w-[1200px] md:max-h-[90vh] overflow-hidden pointer-events-auto rounded-none md:rounded-[2.5rem] bg-white dark:bg-[#0A1C3A]/95 dark:backdrop-blur-3xl border-0 md:border border-black/5 dark:border-white/10 shadow-none md:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_80px_-20px_rgba(33,212,253,0.25)] flex flex-col"
                >
                  {/* Mobile Header (Sticky Native-like) */}
                  <div className="md:hidden shrink-0 flex items-center p-4 bg-white/95 dark:bg-[#0A1C3A]/95 backdrop-blur-xl border-b border-border/50 dark:border-white/10 shadow-sm z-30">
                    <div className="flex items-center gap-4 w-full">
                      <button
                        onClick={() => setActiveFeature(null)}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-800 dark:text-white transition-all shrink-0 shadow-sm"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white truncate">{FEATURES_DATA[activeFeature].title}</span>
                    </div>
                  </div>

                  {/* Desktop Close Button */}
                  <button
                    onClick={() => setActiveFeature(null)}
                    className="hidden md:flex absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 items-center justify-center text-slate-800 dark:text-white transition-all shadow-sm hover:scale-105"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Scrollable Container */}
                  <div className="flex-1 overflow-y-auto flex flex-col md:flex-row hide-scrollbar relative z-10">

                    {/* Image Section (65%) */}
                    <div className="w-full md:w-[65%] shrink-0 bg-slate-50 dark:bg-[#06152F]/50 relative min-h-[220px] md:min-h-[300px] flex items-center justify-center p-6 md:p-12 border-b md:border-b-0 md:border-r border-border/50 dark:border-white/5">
                      <div className="w-full max-w-[360px] md:max-w-none aspect-[4/3] md:aspect-[16/10] rounded-2xl bg-white dark:bg-[#0A1C3A] border border-border/50 dark:border-white/10 flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 dark:opacity-20" />

                        {(FEATURES_DATA[activeFeature].images?.length || 0) > 1 && (
                          <>
                            <button
                              onClick={() => setActiveImageIndex((prev) => prev === 0 ? FEATURES_DATA[activeFeature].images!.length - 1 : prev - 1)}
                              className="absolute left-2 md:left-4 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 flex items-center justify-center shadow-lg border border-border/50 dark:border-white/10 text-slate-800 dark:text-white transition-all hover:scale-105"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setActiveImageIndex((prev) => prev === FEATURES_DATA[activeFeature].images!.length - 1 ? 0 : prev + 1)}
                              className="absolute right-2 md:right-4 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 flex items-center justify-center shadow-lg border border-border/50 dark:border-white/10 text-slate-800 dark:text-white transition-all hover:scale-105"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-10">
                              {FEATURES_DATA[activeFeature].images!.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveImageIndex(idx)}
                                  className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-primary w-4' : 'bg-slate-300 dark:bg-slate-600 hover:bg-primary/50'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        <Image 
                          src={FEATURES_DATA[activeFeature].images ? FEATURES_DATA[activeFeature].images![activeImageIndex] : FEATURES_DATA[activeFeature].image}
                          alt={FEATURES_DATA[activeFeature].title}
                          fill
                          className="object-cover object-top z-0"
                        />
                      </div>
                    </div>

                    {/* Content Section (35%) */}
                    <div className="w-full md:w-[35%] shrink-0 p-6 md:p-12 pb-16 md:pb-12 flex flex-col bg-white dark:bg-transparent">
                      <div className="hidden md:flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center text-primary mb-8 border border-primary/20 shadow-sm">
                        {React.createElement(FEATURES_DATA[activeFeature].icon, { className: "h-7 w-7" })}
                      </div>

                      <h3 className="hidden md:block text-3xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">{FEATURES_DATA[activeFeature].title}</h3>

                      <p className="text-base md:text-lg text-slate-600 dark:text-white/70 mb-8 md:mb-10 leading-relaxed font-medium">
                        {FEATURES_DATA[activeFeature].desc}
                      </p>

                      <ul className="space-y-4 md:space-y-5">
                        {FEATURES_DATA[activeFeature].benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-4 text-slate-800 dark:text-white/90 font-semibold text-sm md:text-base">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary shrink-0 md:mt-0.5">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span className="leading-snug pt-0.5">{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Mobile End-of-content Indicator */}
                      <div className="md:hidden mt-12 flex items-center justify-center opacity-30">
                        <div className="w-12 h-1 rounded-full bg-slate-400 dark:bg-white/40" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <div className="h-16 md:h-32" />

        {/* Pricing Section */}
        <section id="harga" className="py-16 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Investasi untuk Efisiensi</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Satu harga jujur tanpa biaya tersembunyi. Tingkatkan profesionalisme kelas renang Anda.</p>
            </div>

            {/* Value Comparison */}
            <div className="max-w-4xl mx-auto mb-10 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] glass-card border border-red-500/10 bg-red-500/5">
                <h4 className="font-bold text-lg text-red-500/80 mb-6 flex items-center gap-2">
                  <X className="h-5 w-5" /> Tanpa Mecca Swim
                </h4>
                <ul className="space-y-4">
                  {['Absensi manual dengan kertas', 'Rekap data memakan waktu', 'Data mudah tercecer/hilang', 'Laporan lambat ke orang tua'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-[2rem] glass-card border border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <h4 className="font-bold text-lg text-primary mb-6 flex items-center gap-2 relative z-10">
                  <CheckCircle2 className="h-5 w-5" /> Dengan Mecca Swim
                </h4>
                <ul className="space-y-4 relative z-10">
                  {['QR Code otomatis & instan', 'Rekap satu klik langsung jadi', 'Histori tersimpan rapi di Cloud', 'Notifikasi instan ke orang tua'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground font-medium text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(33,212,253,0.8)]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter */}
              <div className="p-10 rounded-[2.5rem] glass-card flex flex-col hover-lift border border-border/50">
                <h3 className="font-bold text-2xl mb-2 text-foreground">Starter</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-5xl font-black text-foreground">Gratis</span>
                </div>
                <ul className="space-y-5 mb-10 flex-1">
                  {['1 Kelas Latihan', '20 Murid Maksimal', 'QR Code Presensi', 'Dashboard Dasar'].map((f, i) => (
                    <li key={i} className="flex items-center gap-4 text-muted-foreground font-medium text-sm">
                      <CheckCircle2 className="h-5 w-5 text-foreground/30 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="w-full py-5 rounded-2xl border border-border font-bold text-center hover:bg-muted transition-colors text-lg">Coba Gratis Sekarang</Link>
              </div>

              {/* Growth */}
              <div className="p-10 rounded-[2.5rem] glass-card border-2 border-primary relative flex flex-col glow-cyan lg:scale-105 z-10 hover-lift bg-white/60 dark:bg-[#0A1C3A]/90 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full uppercase tracking-widest shadow-[0_4px_14px_0_rgba(33,212,253,0.39)] flex items-center gap-2 whitespace-nowrap">
                  🔥 Pilihan Terbaik Instruktur
                </div>
                <h3 className="font-bold text-2xl mb-2 text-primary mt-2">Growth</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-5xl font-black text-foreground">Rp49k</span>
                  <span className="text-muted-foreground font-medium">/ bln</span>
                </div>
                <ul className="space-y-5 mb-10 flex-1">
                  {['10 Kelas Latihan', '300 Murid Maksimal', 'WhatsApp Otomatis', 'Portal Orang Tua', 'Export Excel Laporan'].map((f, i) => (
                    <li key={i} className="flex items-start gap-4 font-semibold text-foreground text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=growth" className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-center hover:brightness-110 transition-all text-lg shadow-[0_4px_14px_0_rgba(33,212,253,0.39)] hover:scale-[1.02]">Mulai Growth</Link>
              </div>

              {/* Academy */}
              <div className="p-10 rounded-[2.5rem] glass-card flex flex-col hover-lift border border-border/50">
                <h3 className="font-bold text-2xl mb-2 text-foreground">Academy</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-5xl font-black text-foreground">Rp149k</span>
                  <span className="text-muted-foreground font-medium">/ bln</span>
                </div>
                <ul className="space-y-5 mb-10 flex-1">
                  {['Manajemen Skala Besar', 'Multi Cabang', 'Multi Guru', 'Custom Branding', 'Prioritas Support 24/7'].map((f, i) => (
                    <li key={i} className="flex items-center gap-4 text-muted-foreground font-medium text-sm">
                      <CheckCircle2 className="h-5 w-5 text-foreground/30 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact?plan=academy" className="w-full py-5 rounded-2xl border border-border font-bold text-center hover:bg-muted transition-colors text-lg">Hubungi Tim Kami</Link>
              </div>
            </div>

            {/* Enhanced Trust Cards */}
            <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { icon: ShieldCheck, title: "Data Aman Tersimpan", desc: "Menggunakan penyimpanan cloud modern dan auto-backup berkala." },
                { icon: Zap, title: "Tanpa Biaya Setup", desc: "Langsung digunakan secara instan tanpa biaya awal atau instalasi." },
                { icon: TrendingUp, title: "Upgrade Kapan Saja", desc: "Naikkan skala paket dengan mudah sesuai pertumbuhan bisnis Anda." },
                { icon: XCircle, title: "Cancel Kapan Saja", desc: "Berhenti berlangganan kapan pun tanpa kontrak tahunan atau penalti." }
              ].map((item, i) => (
                <div key={i} className="group p-6 rounded-[2rem] glass-card border border-border/50 bg-background/50 hover:bg-muted/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-foreground font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="h-16 md:h-32" />

        {/* Premium Animated FAQ */}
        <section id="faq" className="py-12 md:py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Masih ragu? Temukan jawaban dari kekhawatiran Anda di bawah ini dan ambil keputusan dengan lebih tenang.</p>
            </div>

            <FAQSection />

            {/* Contact CTA below FAQ */}
            <div className="mt-12 md:mt-20 p-10 md:p-12 rounded-[2.5rem] glass-card border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent text-center shadow-lg">
              <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Tidak menemukan jawaban yang Anda cari?</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Tim support ahli kami selalu siap membantu Anda menjawab pertanyaan seputar fitur, teknis, maupun bantuan integrasi.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className="inline-flex items-center justify-center font-bold text-lg h-14 px-8 rounded-full bg-foreground text-background shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform w-full sm:w-auto">
                  Hubungi Tim Kami
                </Link>
                <Link href="/demo/dashboard" className="inline-flex items-center justify-center font-bold text-lg h-14 px-8 rounded-full border border-border bg-background/50 backdrop-blur-md hover:bg-muted transition-colors w-full sm:w-auto">
                  Lihat Demo Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Space Separator */}
        <div className="h-10 md:h-20" />

        {/* Premium Dark CTA Section (Always Dark Theme) */}
        <section className="py-12 md:py-24 px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto rounded-[3rem] bg-[#06152F] text-white p-10 md:p-20 relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5"
          >
            {/* Background elements for dark CTA */}
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.05] mix-blend-overlay" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/20 blur-[150px] rounded-full pointer-events-none" />

            {/* Light floating shapes & patterns */}
            <Waves className="absolute -bottom-10 -left-10 h-64 w-64 text-primary opacity-10 rotate-12 pointer-events-none" />
            <QrCode className="absolute top-10 -right-10 h-64 w-64 text-white opacity-[0.03] -rotate-12 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">

              {/* Mini Statistics */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
                {[
                  { value: '90%', label: 'Waktu Administrasi Dihemat' },
                  { value: '100%', label: 'Presensi Tercatat Real-time' },
                  { value: '24/7', label: 'Akses Data Kehadiran' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black text-primary mb-1">{stat.value}</span>
                    <span className="text-sm md:text-base text-white/60 font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight leading-tight max-w-4xl">
                Hentikan Absensi Manual. <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-200">
                  Kelola Kelas Lebih Profesional.
                </span>
              </h2>

              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                Bergabung dengan instruktur modern lainnya. Buat akun gratis sekarang dan rasakan sendiri kemudahan manajemen kelas tanpa ribet.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center font-bold text-lg h-16 px-10 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform w-full sm:w-auto shadow-[0_0_40px_rgba(33,212,253,0.4)]"
                >
                  Coba Gratis Sekarang
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center font-bold text-lg h-16 px-10 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                >
                  Hubungi Tim Sales
                </Link>
              </div>

              {/* FAQ Follow-up Text */}
              <p className="mt-8 text-white/50 text-sm font-medium">
                Masih memiliki pertanyaan? <Link href="/contact" className="text-primary hover:text-white transition-colors underline underline-offset-4">Tim kami siap membantu Anda.</Link>
              </p>

              {/* Trust Indicators */}
              <div className="mt-8 md:mt-16 pt-10 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-white/60 w-full max-w-4xl mx-auto">
                {[
                  'Gratis Memulai',
                  'Setup Kurang Dari 5 Menit',
                  'Tanpa Kontrak Jangka Panjang',
                  'Data Aman & Tersimpan'
                ].map((trust, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {trust}
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        </section>
      </main>

      {/* Seamless Soft Glow Transition to Footer */}
      <div className="w-full max-w-4xl mx-auto mt-10 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Premium Footer */}
      <footer className="bg-background pt-16 md:pt-24 pb-8 md:pb-12 relative overflow-hidden">
        {/* Soft footer glow */}
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[50vw] h-[30vw] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-20">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-3 select-none">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden glass-card">
                  <Image src="/icons/logo.png" alt="Logo" fill className="object-cover" />
                </div>
                <span className="font-extrabold text-2xl tracking-wider text-foreground">
                  {APP_NAME}
                </span>
              </div>
              <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
                Platform SaaS khusus manajemen presensi les renang yang modern, otomatis, dan profesional.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Produk</h4>
              <ul className="space-y-5 text-muted-foreground font-medium">
                <li><Link href="#fitur" className="hover:text-primary transition-colors">Fitur Utama</Link></li>
                <li><Link href="#harga" className="hover:text-primary transition-colors">Harga</Link></li>
                <li><Link href="/demo/dashboard" className="hover:text-primary transition-colors">Demo Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-foreground">Perusahaan</h4>
              <ul className="space-y-5 text-muted-foreground font-medium">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-muted-foreground">
            <p>© {new Date().getFullYear()} Mecca Swim. All Rights Reserved.</p>
            <div className="flex items-center gap-2">
              Dibuat dengan <Waves className="h-4 w-4 text-primary" /> untuk Industri Renang
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {scrollY > 500 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 md:bottom-28 md:right-10 z-50 p-3 md:p-4 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all focus:outline-none flex items-center justify-center group"
            aria-label="Kembali ke atas"
          >
            <ChevronUp className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:-translate-y-1" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatWidget />
    </div>
  );
}

const FAQ_DATA = [
  {
    category: "Penggunaan Sistem",
    icon: Smartphone,
    items: [
      { q: "Apakah murid harus install aplikasi?", a: "Sama sekali tidak. Murid atau orang tua hanya perlu menggunakan kamera smartphone bawaan mereka untuk scan QR Code." },
      { q: "Bagaimana jika murid tidak membawa HP?", a: "Guru tetap dapat melakukan absensi manual (centang) langsung dari Dashboard Guru untuk murid tersebut dalam hitungan detik." },
      { q: "Apakah bisa digunakan untuk lebih dari satu kelas?", a: "Ya, Anda bisa membuat kelas sebanyak mungkin tanpa batasan untuk mengelompokkan jadwal, level, atau lokasi." },
      { q: "Apakah bisa digunakan oleh beberapa guru sekaligus?", a: "Tentu. Paket Academy kami mendukung fitur Multi Guru sehingga asisten atau guru lain bisa melakukan presensi secara paralel." },
      { q: "Apakah sistem tetap bisa digunakan jika internet lambat?", a: "Aplikasi kami sangat ringan dan dioptimalkan untuk tetap bekerja dengan lancar pada koneksi internet seluler standar di area kolam renang." },
    ]
  },
  {
    category: "Orang Tua & Pelaporan",
    icon: Users,
    items: [
      { q: "Apakah orang tua wajib memiliki akun?", a: "Tidak wajib. Sistem akan mengirim laporan kehadiran via pesan otomatis langsung ke nomor WhatsApp mereka." },
      { q: "Bagaimana cara orang tua menerima laporan?", a: "Laporan dikirim otomatis via WhatsApp sesaat setelah murid melakukan presensi atau dicentang hadir oleh guru." },
      { q: "Apakah orang tua bisa melihat riwayat kehadiran?", a: "Ya, kami menyediakan Portal Orang Tua berupa link aman khusus untuk melihat grafik dan riwayat kehadiran anak mereka kapan saja." },
      { q: "Apakah data bisa diexport ke Excel?", a: "Tentu. Semua data presensi, performa, dan riwayat murid dapat diekspor ke format Excel (XLSX) hanya dengan satu klik." }
    ]
  },
  {
    category: "Keamanan Data",
    icon: Shield,
    items: [
      { q: "Apakah data saya aman?", a: "Sangat aman. Seluruh data disimpan menggunakan infrastruktur cloud modern dengan enkripsi standar industri dan hanya dapat diakses oleh Anda yang memiliki izin." },
      { q: "Di mana data disimpan?", a: "Data disimpan di server cloud privat dengan sistem auto-backup. Kami menjamin privasi penuh dan tidak akan pernah menjual atau membagikan data Anda ke pihak ketiga." },
      { q: "Apakah data bisa dihapus jika diperlukan?", a: "Ya, Anda memiliki kontrol penuh atas data Anda. Jika Anda memutuskan untuk berhenti, Anda dapat mengekspor data dan menghapusnya secara permanen dari sistem kami." }
    ]
  },
  {
    category: "Paket & Langganan",
    icon: CreditCard,
    items: [
      { q: "Apakah tersedia paket gratis?", a: "Tentu, tersedia paket Starter yang sepenuhnya gratis seumur hidup dengan batas hingga 20 murid dan 1 kelas. Cocok untuk instruktur privat." },
      { q: "Apakah tersedia masa trial untuk paket berbayar?", a: "Anda dapat mengeksplorasi sistem sepenuhnya melalui paket Starter. Untuk memastikan komitmen kami, paket Growth/Academy memiliki garansi 14 hari uang kembali." },
      { q: "Bisakah saya berhenti berlangganan kapan saja?", a: "Ya. Tidak ada kontrak mengikat dan tidak ada penalti tersembunyi. Anda memegang kendali untuk mengubah paket atau membatalkan kapan saja." },
      { q: "Apakah sistem dapat digunakan untuk akademi renang skala besar?", a: "Sangat bisa. Paket Academy didesain khusus untuk manajemen institusi dengan banyak cabang, ratusan murid, dan manajemen kolaboratif antar-guru." }
    ]
  }
];

function FAQSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const flatItems = FAQ_DATA.flatMap(g => g.items.map(i => ({ ...i, category: g.category })));
  const filteredItems = searchQuery.trim() !== '' 
    ? flatItems.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pertanyaan tentang harga, fitur, dll..."
          className="w-full h-14 pl-12 pr-12 rounded-full border border-border/50 bg-background/50 backdrop-blur-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {searchQuery.trim() !== '' ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground mb-4 pl-2">
            Menampilkan {filteredItems.length} hasil untuk &quot;{searchQuery}&quot;
          </p>
          {filteredItems.length > 0 ? (
            filteredItems.map((faq, i) => (
              <div key={i} className="relative">
                <span className="text-xs font-bold text-primary mb-2 block pl-2">{faq.category}</span>
                <FAQItem question={faq.q} answer={faq.a} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 glass-card rounded-3xl border border-border/50">
              <p className="text-muted-foreground">Tidak menemukan pertanyaan yang cocok.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {FAQ_DATA.map((group, idx) => (
            <div key={idx} className={`glass-card rounded-[1.5rem] overflow-hidden transition-all duration-300 ${openCategory === group.category ? 'border-primary ring-1 ring-primary/20 shadow-[0_4px_30px_rgba(33,212,253,0.15)] dark:bg-[#0A1C3A]/50' : 'hover:border-primary/30 border-border/50 bg-background/50 hover:bg-muted/30'}`}>
              <button
                onClick={() => setOpenCategory(openCategory === group.category ? null : group.category)}
                className="w-full p-4 md:p-6 text-left flex items-center justify-between focus:outline-none group/btn"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${openCategory === group.category ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary group-hover/btn:bg-primary/20'}`}>
                    <group.icon className="h-5 w-5" />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold tracking-tight transition-colors ${openCategory === group.category ? 'text-primary' : 'text-foreground'}`}>{group.category}</h3>
                </div>
                <motion.div
                  animate={{ rotate: openCategory === group.category ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`shrink-0 ${openCategory === group.category ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openCategory === group.category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3 border-t border-border/30 pt-4">
                      {group.items.map((faq, i) => (
                        <FAQItem key={i} question={faq.q} answer={faq.a} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom FAQ Accordion Component using Framer Motion
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`glass-card rounded-[1.5rem] overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary ring-1 ring-primary/20 shadow-[0_4px_30px_rgba(33,212,253,0.15)] dark:bg-[#0A1C3A]/50' : 'hover:border-primary/30 border-border/50 bg-background/50 hover:bg-muted/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 md:p-8 text-left flex items-center justify-between focus:outline-none"
      >
        <span className={`font-bold text-lg md:text-xl pr-8 transition-colors ${isOpen ? 'text-primary' : 'text-foreground'}`}>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary'}`}
        >
          <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 text-base md:text-lg text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
