'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/constants';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { signIn, resetPassword, loading, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg('Email dan kata sandi harus diisi');
        return;
      }
      const success = await signIn(email, password);
      if (!success) setErrorMsg('Email atau password salah');
    } else if (activeTab === 'forgot-password') {
      if (!email.trim()) {
        setErrorMsg('Email harus diisi');
        return;
      }
      try {
        await resetPassword(email);
      } catch (err) {
        // Silently catch errors to prevent enumeration
        console.error('Reset password error:', err);
      } finally {
        // Enterprise Security: Always show success UI regardless of actual email existence
        setResetEmailSent(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 water-pattern flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated glowing backdrops */}
      <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-teal-500/10 blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="w-full max-w-md z-10 animate-scale-in">
        {/* Brand Label */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-20 w-20 relative flex items-center justify-center mb-2 rounded-full overflow-hidden shadow-md border-2 border-white/50 dark:border-slate-800/50 bg-white dark:bg-slate-900">
            <Image src="/icons/logo.png" alt="Mecca Swim Logo" fill className="object-cover" />
          </div>
          <h1 className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-400 dark:to-teal-300">
            {APP_NAME}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sistem Presensi Guru Les Renang</p>
        </div>

        <Card variant="glass" className="border-slate-200/50 dark:border-white/10 shadow-glass-lg backdrop-blur-xl bg-white/80 dark:bg-slate-900/60">
          <CardHeader className="pb-4">
            {!resetEmailSent ? (
              <>
                <CardTitle className="text-slate-900 dark:text-white text-center">
                  {activeTab === 'login' ? 'Selamat Datang Kembali' : 'Lupa Password'}
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-center text-xs mt-1">
                  {activeTab === 'login'
                    ? 'Silakan masuk ke dasbor presensi Anda'
                    : 'Masukkan email Anda untuk menerima tautan reset password'}
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-slate-900 dark:text-white text-center">
                  Email Terkirim
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-center text-xs mt-1">
                  Periksa kotak masuk Anda
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {resetEmailSent ? (
              <div className="flex flex-col items-center text-center py-4 animate-scale-in">
                <div className="h-16 w-16 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse-slow">
                  <Mail className="h-8 w-8" />
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Permintaan Reset Diterima</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Jika email tersebut terdaftar di sistem kami, Anda akan menerima tautan reset password sesaat lagi di:<br />
                  <strong className="text-cyan-600 dark:text-cyan-400 block mt-1 font-mono text-sm">{email}</strong>
                </p>

                <Button 
                  onClick={() => {
                    setResetEmailSent(false);
                    setActiveTab('login');
                    setEmail('');
                  }} 
                  className="w-full"
                  variant="outline"
                >
                  Kembali ke Halaman Masuk
                </Button>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg mb-4 text-center">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    icon={<Mail className="h-4 w-4" />}
                    className="bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />

                  {activeTab === 'login' && (
                    <>
                      <Input
                        label="Kata Sandi *"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={<Lock className="h-4 w-4" />}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                            title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          >
                            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        }
                        className="bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('forgot-password');
                            setErrorMsg(null);
                          }}
                          className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline focus:outline-none"
                        >
                          Lupa Password?
                        </button>
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full mt-6" isLoading={loading}>
                    {activeTab === 'login' ? 'Masuk Sekarang' : 'Kirim Tautan Reset'}
                  </Button>

                  {activeTab === 'forgot-password' && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setErrorMsg(null);
                        }}
                        className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none transition-colors"
                      >
                        Kembali ke Halaman Masuk
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back to Landing Page */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
